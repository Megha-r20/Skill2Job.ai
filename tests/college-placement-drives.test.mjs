import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { placementDriveRepository } from '../lib/repositories/placementDriveRepository.js';
import { generateCsv, generatePrintableReportHtml } from '../lib/utils/exportUtils.js';

describe('College Placement Drives, Department Reports & Exports Suite', () => {
    describe('1. Placement Drive Management', () => {
        it('retrieves active placement drives with eligibility criteria and candidate funnel metrics', async () => {
            const drives = await placementDriveRepository.findAll({ collegeId: 'col_1' });
            assert(Array.isArray(drives), 'Expected an array of drives');
            assert(drives.length >= 4, 'Expected at least 4 default pre-seeded drives');

            const drive = drives[0];
            assert(drive.companyName, 'Drive must contain companyName');
            assert(drive.title, 'Drive must contain title');
            assert(typeof drive.minCgpa === 'number', 'minCgpa must be a number');
            assert(Array.isArray(drive.departments), 'departments must be an array');
            assert(drive.packageCtc, 'packageCtc must be present');
            assert(drive.status, 'status must be present');
            assert(typeof drive.eligibleStudentsCount === 'number');
            assert(typeof drive.registeredStudentsCount === 'number');
        });

        it('filters placement drives by status and department', async () => {
            const regOpenDrives = await placementDriveRepository.findAll({ status: 'Registration Open' });
            assert(regOpenDrives.every(d => d.status.toLowerCase() === 'registration open'));

            const cseDrives = await placementDriveRepository.findAll({ department: 'Computer Science & Engineering' });
            assert(cseDrives.length > 0);
            assert(cseDrives.every(d => d.departments.includes('Computer Science & Engineering')));
        });

        it('schedules a new placement drive and persists it', async () => {
            const newDriveData = {
                collegeId: 'col_1',
                companyName: 'Amazon Web Services',
                title: 'Cloud Support Engineer Associate',
                departments: ['Computer Science & Engineering', 'Information Technology'],
                minCgpa: 7.5,
                batchYear: '2026',
                packageCtc: '₹14,00,000 - ₹18,00,000 / year',
                openings: 10,
                mode: 'On-Campus Lab',
                driveDate: '2026-11-05',
                status: 'Registration Open'
            };

            const created = await placementDriveRepository.create(newDriveData);
            assert(created.id, 'Created drive must have an id');
            assert.equal(created.companyName, 'Amazon Web Services');
            assert.equal(created.status, 'Registration Open');

            const fetched = await placementDriveRepository.findById(created.id);
            assert.equal(fetched.companyName, 'Amazon Web Services');
        });

        it('updates placement drive status and recruitment counts', async () => {
            const drives = await placementDriveRepository.findAll();
            const target = drives[0];

            const updated = await placementDriveRepository.update(target.id, {
                status: 'Assessment Ongoing',
                registeredStudentsCount: 140,
                shortlistedCount: 50
            });

            assert.equal(updated.status, 'Assessment Ongoing');
            assert.equal(updated.registeredStudentsCount, 140);
            assert.equal(updated.shortlistedCount, 50);
        });
    });

    describe('2. Department-Wise Placement & Readiness Intelligence', () => {
        it('calculates comprehensive departmental statistics and compensation benchmarks', async () => {
            const report = await placementDriveRepository.getDepartmentStats('col_1', '2026');

            assert.equal(report.collegeId, 'col_1');
            assert.equal(report.batchYear, '2026');
            assert(report.summary.totalStudents > 0);
            assert(report.summary.totalPlaced > 0);
            assert(typeof report.summary.overallPlacementRate === 'number');

            assert(Array.isArray(report.departments));
            assert(report.departments.length >= 4);

            for (const dept of report.departments) {
                assert(dept.department, 'Must have department name');
                assert(dept.code, 'Must have department code');
                assert(dept.totalStudents >= dept.placedStudents, 'Placed students cannot exceed total');
                assert(dept.placementRate >= 0 && dept.placementRate <= 100);
                assert(dept.averageCtcLpa > 0, 'Average CTC must be positive');
                assert(dept.highestCtcLpa >= dept.averageCtcLpa, 'Highest CTC must be >= Average CTC');
                assert(dept.verifiedReadinessPercent >= 0 && dept.verifiedReadinessPercent <= 100);
                assert(Array.isArray(dept.topRecruiters), 'Must have topRecruiters array');
            }
        });
    });

    describe('3. RFC 4180 CSV Generation & Escaping', () => {
        it('generates well-formed CSV with UTF-8 BOM and escaped commas/quotes', () => {
            const headers = ['Department', 'CTC Package', 'Notes'];
            const rows = [
                ['Computer Science', '₹12,00,000 / year', 'Standard batch'],
                ['AI & Data Science', '₹18,00,000 / year', 'Top tier, "highly" recommended'],
                ['Information Technology', '₹11,00,000 / year', 'Includes multiple\nlines of notes']
            ];

            const csv = generateCsv(headers, rows);
            assert(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');
            assert(csv.includes('"Computer Science"'));
            assert(csv.includes('"Top tier, ""highly"" recommended"'), 'Must escape internal quotes as double quotes');
            assert(csv.includes('"Includes multiple\nlines of notes"'), 'Must escape newlines inside quotes');
        });

        it('generates structured dataset for drives, departments, and students export', async () => {
            const drivesExport = await placementDriveRepository.getExportData('drives');
            assert(drivesExport.headers.includes('Company Name'));
            assert(drivesExport.headers.includes('Package (CTC)'));
            assert(drivesExport.rows.length > 0);

            const deptExport = await placementDriveRepository.getExportData('departments');
            assert(deptExport.headers.includes('Department Name'));
            assert(deptExport.headers.includes('Placement Rate (%)'));
            assert(deptExport.rows.length >= 4);

            const studentExport = await placementDriveRepository.getExportData('students');
            assert(studentExport.headers.includes('Roll Number'));
            assert(studentExport.headers.includes('Student Name'));
            assert(studentExport.rows.length > 0);
        });
    });

    describe('4. Print-Ready HTML / PDF Report Formatting', () => {
        it('generates executive printable document with college letterhead and signatures', () => {
            const html = generatePrintableReportHtml({
                collegeName: 'Apex University of Engineering',
                reportTitle: 'Department-Wise Placement Report',
                batchYear: '2026',
                summaryMetrics: [
                    { label: 'Total Students', value: 400 },
                    { label: 'Placement Rate', value: '72%' }
                ],
                headers: ['Department', 'Placed', 'Avg CTC'],
                rows: [
                    ['Computer Science & Engineering', '78', '13.8 LPA'],
                    ['Information Technology', '48', '11.5 LPA']
                ]
            });

            assert(html.includes('Apex University of Engineering'));
            assert(html.includes('Department-Wise Placement Report'));
            assert(html.includes('Placement & Training Officer'));
            assert(html.includes('Director / Principal'));
            assert(html.includes('@media print'));
            assert(html.includes('Computer Science & Engineering'));
        });
    });
});
