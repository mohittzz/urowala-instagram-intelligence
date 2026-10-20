import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { DEMO_COMMENTS, DEMO_CONTENT_IDEAS, DEMO_HOURLY_COMMENTS } from '@/lib/mock/demo-data';
import { extractFrequentKeywords } from '@/lib/analytics/comment-analyzer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filterQuestion = searchParams.get('questionsOnly') === 'true';
  const topicFilter = searchParams.get('topic');
  const reelId = searchParams.get('reelId');

  const supabase = getServerSupabase();

  if (!supabase) {
    let comments = [...DEMO_COMMENTS];

    if (filterQuestion) {
      comments = comments.filter((c) => c.isQuestion);
    }
    if (topicFilter && topicFilter !== 'all') {
      comments = comments.filter((c) => c.topicId === topicFilter);
    }
    if (reelId) {
      comments = comments.filter((c) => c.reelId === reelId);
    }

    const keywords = extractFrequentKeywords(comments, 15);

    return NextResponse.json({
      isDemo: true,
      comments,
      contentIdeas: DEMO_CONTENT_IDEAS,
      keywords,
      hourlyActivity: DEMO_HOURLY_COMMENTS,
    });
  }

  try {
    let query = supabase
      .from('reel_comments')
      .select(`
        id,
        reel_id,
        text,
        commenter_username,
        posted_at,
        like_count,
        is_question,
        reels (
          caption,
          permalink,
          topic_id,
          topics (name)
        )
      `)
      .order('posted_at', { ascending: false })
      .limit(100);

    if (filterQuestion) {
      query = query.eq('is_question', true);
    }
    if (reelId) {
      query = query.eq('reel_id', reelId);
    }

    const { data: rawComments, error } = await query;

    if (error || !rawComments || rawComments.length === 0) {
      return NextResponse.json({
        isDemo: true,
        comments: DEMO_COMMENTS,
        contentIdeas: DEMO_CONTENT_IDEAS,
        keywords: extractFrequentKeywords(DEMO_COMMENTS, 15),
        hourlyActivity: DEMO_HOURLY_COMMENTS,
      });
    }

    const formattedComments = rawComments.map((c: any) => {
      const reelObj = c.reels;
      const topicObj = reelObj?.topics;
      return {
        id: c.id,
        reelId: c.reel_id,
        reelCaption: reelObj?.caption || 'Reel',
        reelPermalink: reelObj?.permalink || '#',
        text: c.text,
        commenterUsername: c.commenter_username || 'user',
        postedAt: c.posted_at,
        postedAtIST: c.posted_at,
        likeCount: c.like_count,
        isQuestion: c.is_question,
        topicId: reelObj?.topic_id || 'general_education',
        topicName: topicObj?.name || 'General Urology',
      };
    });

    const keywords = extractFrequentKeywords(formattedComments, 15);

    return NextResponse.json({
      isDemo: false,
      comments: formattedComments,
      contentIdeas: DEMO_CONTENT_IDEAS,
      keywords,
      hourlyActivity: DEMO_HOURLY_COMMENTS,
    });
  } catch (err: any) {
    return NextResponse.json({
      isDemo: true,
      comments: DEMO_COMMENTS,
      contentIdeas: DEMO_CONTENT_IDEAS,
      keywords: extractFrequentKeywords(DEMO_COMMENTS, 15),
      hourlyActivity: DEMO_HOURLY_COMMENTS,
    });
  }
}
