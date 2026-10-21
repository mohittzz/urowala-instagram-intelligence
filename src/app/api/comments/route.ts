import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { DEMO_COMMENTS, DEMO_CONTENT_IDEAS, DEMO_HOURLY_COMMENTS } from '@/lib/mock/demo-data';
import { extractFrequentKeywords, generateContentIdeasFromComments } from '@/lib/analytics/comment-analyzer';
import { HourlyCommentPoint } from '@/lib/types/analytics';
import { formatISTDate } from '@/lib/utils/formatters';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filterQuestion = searchParams.get('questionsOnly') === 'true';
  const topicFilter = searchParams.get('topic');
  const reelId = searchParams.get('reelId');

  const supabase = getServerSupabase();

  if (!supabase) {
    let comments = [...DEMO_COMMENTS];
    if (filterQuestion) comments = comments.filter((c) => c.isQuestion);
    if (topicFilter && topicFilter !== 'all') comments = comments.filter((c) => c.topicId === topicFilter);
    if (reelId) comments = comments.filter((c) => c.reelId === reelId);

    return NextResponse.json({
      isDemo: true,
      comments,
      contentIdeas: DEMO_CONTENT_IDEAS,
      keywords: extractFrequentKeywords(comments, 15),
      hourlyActivity: DEMO_HOURLY_COMMENTS,
    });
  }

  try {
    // 1. Fetch raw comments with reel metadata
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
      .limit(300);

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

    let formattedComments = rawComments.map((c: any) => {
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
        postedAtIST: formatISTDate(c.posted_at),
        likeCount: c.like_count,
        isQuestion: c.is_question,
        topicId: reelObj?.topic_id || 'general_education',
        topicName: topicObj?.name || 'General Urology',
      };
    });

    if (topicFilter && topicFilter !== 'all') {
      formattedComments = formattedComments.filter((c) => c.topicId === topicFilter);
    }

    // 2. Generate content ideas from real questions
    const contentIdeas = generateContentIdeasFromComments(rawComments);

    // 3. Extract frequent keywords
    const keywords = extractFrequentKeywords(formattedComments, 15);

    // 4. Calculate real hourly comment distribution in Asia/Kolkata (IST)
    const hourCounts = new Array(24).fill(0).map(() => ({ comments: 0, questions: 0 }));
    for (const c of rawComments) {
      if (c.posted_at) {
        const date = new Date(c.posted_at);
        const istHour = (date.getUTCHours() + 5 + Math.floor((date.getUTCMinutes() + 30) / 60)) % 24;
        hourCounts[istHour].comments += 1;
        if (c.is_question) {
          hourCounts[istHour].questions += 1;
        }
      }
    }

    const hourlyActivity: HourlyCommentPoint[] = hourCounts.map((hc, hour) => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const hourString = `${String(displayHour).padStart(2, '0')} ${ampm}`;
      return {
        hour: hourString,
        commentsCount: hc.comments,
        questionCount: hc.questions,
      };
    });

    return NextResponse.json({
      isDemo: false,
      comments: formattedComments,
      contentIdeas,
      keywords,
      hourlyActivity,
    });
  } catch (err: any) {
    console.error('[Comments Route Error]', err);
    return NextResponse.json({
      isDemo: true,
      comments: DEMO_COMMENTS,
      contentIdeas: DEMO_CONTENT_IDEAS,
      keywords: extractFrequentKeywords(DEMO_COMMENTS, 15),
      hourlyActivity: DEMO_HOURLY_COMMENTS,
    });
  }
}
