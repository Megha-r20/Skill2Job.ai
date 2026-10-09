import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { certificateRepository } from '@/lib/repositories/certificateRepository';

export async function POST(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const assessmentId = params.id;
        const assessment = await assessmentRepository.findById(assessmentId);
        if (!assessment) {
            return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
        }

        const body = await request.json().catch(() => ({}));
        const studentId = session.userId || body.studentId || session.email;
        const student = await studentRepository.findById(studentId) || {
            id: studentId,
            fullName: session.name || 'Alex Rivera',
            collegeName: 'Apex University of Engineering'
        };

        const {
            answers = {},
            tabSwitches = 0,
            blurCount = 0,
            headTurns = 0,
            violation = false
        } = body;

        // Fetch official assessment questions
        const questions = await assessmentRepository.getQuestions(assessmentId);
        const totalQuestions = questions.length || 1;

        // Proctoring Integrity Audit
        const totalViolations = (Number(tabSwitches) || 0) + (Number(blurCount) || 0) + (Number(headTurns) || 0);
        const isDisqualified = violation === true || (Number(tabSwitches) || 0) >= 3 || totalViolations >= 5;

        // Grade submitted answers
        let earnedPoints = 0;
        let totalPossiblePoints = 0;
        let correctCount = 0;
        const feedback = [];

        questions.forEach((q, index) => {
            const points = q.points || 10;
            totalPossiblePoints += points;
            const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : (q.correctOptionIndex ?? 0);
            const studentSelected = answers[q.id];
            const isCorrect = studentSelected !== undefined && Number(studentSelected) === correctIdx;

            if (isCorrect) {
                earnedPoints += points;
                correctCount++;
            }

            feedback.push({
                questionId: q.id,
                questionNumber: index + 1,
                questionText: q.questionText || q.question,
                selectedOption: studentSelected !== undefined ? studentSelected : null,
                correctOption: correctIdx,
                isCorrect,
                pointsAwarded: isCorrect ? points : 0,
                explanation: q.explanation || 'Verified technical competency question.'
            });
        });

        const calculatedScore = totalPossiblePoints > 0 
            ? Math.round((earnedPoints / totalPossiblePoints) * 100) 
            : 0;

        const passingScore = assessment.passingScore || 75;
        const passedExam = !isDisqualified && calculatedScore >= passingScore;

        let proctoringStatus = 'CLEAN_PROCTORED';
        let integrityScore = 100;
        if (isDisqualified) {
            proctoringStatus = 'DISQUALIFIED';
            integrityScore = 0;
        } else if (totalViolations > 0) {
            proctoringStatus = 'FLAGGED_WITH_WARNINGS';
            integrityScore = Math.max(50, 100 - (totalViolations * 10));
        }

        const finalScore = isDisqualified ? 0 : calculatedScore;
        const skillName = assessment.skillName || assessment.skill || 'Technical Skill';
        const awardedLevel = finalScore >= 85 ? 'Advanced' : finalScore >= 75 ? 'Intermediate' : 'Beginner';

        let issuedCertificate = null;

        // If passed, upgrade candidate's skill record and issue cryptographic digital certificate
        if (passedExam) {
            const credibilityScore = Math.min(100, Math.round(integrityScore * 0.9 + 10));

            // 1. Upgrade skill in student repository
            await studentRepository.addOrUpdateSkill(student.id || studentId, {
                skillName,
                category: assessment.category || 'Technical Capability',
                level: awardedLevel,
                score: finalScore,
                credibilityScore,
                status: 'Verified',
                verifiedAt: new Date().toISOString(),
                assessmentId
            });

            // 2. Issue official digital certificate
            issuedCertificate = await certificateRepository.create({
                studentId: student.id || studentId,
                studentName: student.fullName || session.name || 'Candidate',
                studentEmail: student.email || session.email,
                collegeName: student.collegeName || 'Apex University of Engineering',
                skillName,
                skillCategory: assessment.category || 'Technical Capability',
                level: awardedLevel,
                score: finalScore,
                proctoringStatus,
                proctoringScore: integrityScore,
                violationsCount: totalViolations
            });

            // 3. Recalculate student placement readiness
            await studentRepository.updatePlacementReadiness(student.id || studentId);
        }

        return NextResponse.json({
            success: true,
            passed: passedExam,
            score: finalScore,
            passingScore,
            totalQuestions,
            correctCount,
            awardedLevel,
            proctoring: {
                status: proctoringStatus,
                integrityScore,
                violationsCount: totalViolations,
                tabSwitches: Number(tabSwitches) || 0,
                blurCount: Number(blurCount) || 0,
                headTurns: Number(headTurns) || 0,
                isDisqualified
            },
            disqualificationReason: isDisqualified 
                ? 'Integrity violation: window/tab switching thresholds exceeded during monitored session.'
                : null,
            feedback,
            certificate: issuedCertificate
        });
    } catch (error) {
        console.error('[assessments-submit] Grading error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
