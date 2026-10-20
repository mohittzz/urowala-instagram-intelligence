import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { reelId, topicId } = await request.json();

    if (!reelId || !topicId) {
      return NextResponse.json({ error: 'reelId and topicId are required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      // In demo mode, acknowledge topic update successfully in-memory
      return NextResponse.json({ success: true, mode: 'demo', reelId, topicId });
    }

    const { error } = await supabase
      .from('reels')
      .update({
        topic_id: topicId,
        topic_manual_override: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reelId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reelId, topicId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
