import { NextRequest, NextResponse } from 'next/server';
const calculateCollegeSkillHeatmap = (a: any) => ({});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collegeId = params.id;
    const heatmapData = calculateCollegeSkillHeatmap(collegeId);

    return NextResponse.json({
      success: true,
      ...heatmapData
    });
  } catch (error) {
    console.error('Error calculating skill heatmap:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
