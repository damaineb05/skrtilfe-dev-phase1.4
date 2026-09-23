# PHASE ONE DISCOVERY SCORE FOUNDATION PASS
**Date:** 2026-05-11 | **Phase:** Discovery Architecture Foundation  
**Status:** 🏗️ ARCHITECTURAL FOUNDATION DESIGNED | **Implementation:** Ready for Phase Two

---

## EXECUTIVE SUMMARY

Designed **clean foundational architecture** for future controlled discovery system aligned with Skrtlife philosophy of **authenticity > virality**, **consistency > spam**, **cultural resonance > engagement farming**.

**What This IS:** Clean data structure + modular hooks for future Discovery Score system.

**What This IS NOT:** Recommendation engine, virality ranking, addictive algorithms.

**Architecture Status: READY FOR IMPLEMENTATION** ✅

---

## CORE PHILOSOPHY ALIGNMENT

### Enigma Controlled Discovery Principles
```
REWARD:
  ✅ Authenticity     — Consistent creators over one-hit wonders
  ✅ Consistency      — Ongoing engagement over spam bursts
  ✅ Cultural Resonance — Community-relevant content over rage bait
  ✅ Intentional Engagement — Saved/commented over mindless scrolled

REJECT:
  ❌ Rage Bait       — Inflammatory for engagement
  ❌ Spam Posting     — Volume over quality
  ❌ Artificial Virality — Algorithm-gaming over organic reach
  ❌ Infinite Scroll  — Dopamine farming, addiction mechanics
```

---

## DISCOVERY SCORE FOUNDATION ARCHITECTURE

### Data Structure: DiscoveryScore Entity

```json
{
  "id": "string",
  "creator_email": "string",
  "post_id": "string | null",
  "score": 0.0,
  "scored_at": "ISO datetime",
  
  "inputs": {
    "authenticity": {
      "creator_consistency_days": 365,
      "post_frequency_week": 3,
      "verified_identity": true,
      "community_tenure_months": 12
    },
    "cultural_resonance": {
      "saves_count": 45,
      "meaningful_comments_count": 12,
      "shares_from_community": 8,
      "community_mentions": 3
    },
    "anti_spam": {
      "posting_velocity_hour": 1,
      "hashtag_spam_score": 0.2,
      "engagement_authenticity": 0.92,
      "report_count": 0
    },
    "engagement_quality": {
      "comment_depth_avg": 3.2,
      "conversation_initiated": true,
      "follow_through_rate": 0.78,
      "response_rate": 0.85
    }
  },
  
  "moderation_flags": {
    "is_flagged": false,
    "spam_likelihood": 0.1,
    "harassment_likelihood": 0.05,
    "quality_score": 0.88
  },
  
  "visibility_multiplier": 1.0,
  "metadata": {
    "calculated_by": "discovery_engine_v1",
    "next_recalc": "ISO datetime"
  }
}
```

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ DISCOVERY SCORE FOUNDATION ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. DATA COLLECTION LAYER (Passive)                          │
│    └─ useDiscoveryMetrics() hook                           │
│       • Tracks saves without algorithmic ranking            │
│       • Counts meaningful comments (>5 chars)              │
│       • Records profile visits                             │
│       • Tracks sharing/reposting                           │
│       • Does NOT track: scroll velocity, dwell time        │
│                                                             │
│ 2. AUTHENTICITY SCORING (Creator-Centric)                   │
│    └─ calculateAuthenticityScore()                         │
│       • Days active (rewards consistency)                  │
│       • Post frequency (not frequency-gamed)               │
│       • Community tenure (not new-account bias)            │
│       • Identity verification (optional)                   │
│                                                             │
│ 3. CULTURAL RESONANCE SCORING (Community-Centric)           │
│    └─ calculateCulturalResonance()                         │
│       • Saves (explicit interest)                          │
│       • Meaningful comments (engagement quality)           │
│       • Community shares (peer validation)                 │
│       • Community mentions (cultural relevance)            │
│                                                             │
│ 4. ANTI-SPAM MODERATION (Safety Layer)                      │
│    └─ calculateAntiSpamScore()                             │
│       • Posting velocity (burst detection)                 │
│       • Hashtag spam (keyword farming)                     │
│       • Engagement authenticity (bot detection)            │
│       • User reports (community moderation)                │
│                                                             │
│ 5. ENGAGEMENT QUALITY SCORING (Conversation-Centric)        │
│    └─ calculateEngagementQuality()                         │
│       • Comment depth (thoughtful over reactive)           │
│       • Conversation initiated (creator responded)         │
│       • Follow-through rate (creator consistency)          │
│       • Response rate to followers                         │
│                                                             │
│ 6. VISIBILITY MULTIPLIER (Future Discovery Use)             │
│    └─ calculateVisibilityMultiplier()                      │
│       • Base score × quality inputs                        │
│       • Applied ONLY to curated discovery sections          │
│       • Does NOT affect organic timeline                   │
│       • Decays over time to prevent stickiness             │
│                                                             │
│ 7. DISCOVERY GATEWAY (Controlled Entry Point)               │
│    └─ Curated Discovery Sections (Not Algorithmic Feed)   │
│       • Creator Spotlights (manual + score-informed)       │
│       • Rising Creators (consistent performers)            │
│       • Community Picks (community voting)                 │
│       • Drops & Collections (editorial)                    │
│       • NO infinite feed optimization                      │
│                                                             │
│ 8. MODERATION HOOKS (Future Anti-Abuse)                     │
│    └─ Spam detection, harassment flagging, quality gates   │
│       • Prepared for ML-based detection (Phase Two+)       │
│       • Manual moderation tools (exists)                   │
│       • Community reporting (foundation ready)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ENTITY DESIGN: DiscoveryScore

**Location:** `entities/DiscoveryScore.json`

```json
{
  "name": "DiscoveryScore",
  "type": "object",
  "properties": {
    "creator_email": {
      "type": "string",
      "description": "Email of the creator being scored"
    },
    "post_id": {
      "type": "string",
      "description": "Post ID if scoring a specific post, null for creator-level score"
    },
    "score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Overall discovery score (0–100)"
    },
    "scored_at": {
      "type": "string",
      "format": "date-time",
      "description": "When this score was calculated"
    },
    "inputs": {
      "type": "object",
      "properties": {
        "authenticity": {
          "type": "object",
          "properties": {
            "creator_consistency_days": {"type": "integer"},
            "post_frequency_week": {"type": "number"},
            "verified_identity": {"type": "boolean"},
            "community_tenure_months": {"type": "integer"}
          }
        },
        "cultural_resonance": {
          "type": "object",
          "properties": {
            "saves_count": {"type": "integer"},
            "meaningful_comments_count": {"type": "integer"},
            "shares_from_community": {"type": "integer"},
            "community_mentions": {"type": "integer"}
          }
        },
        "anti_spam": {
          "type": "object",
          "properties": {
            "posting_velocity_hour": {"type": "number"},
            "hashtag_spam_score": {"type": "number"},
            "engagement_authenticity": {"type": "number"},
            "report_count": {"type": "integer"}
          }
        },
        "engagement_quality": {
          "type": "object",
          "properties": {
            "comment_depth_avg": {"type": "number"},
            "conversation_initiated": {"type": "boolean"},
            "follow_through_rate": {"type": "number"},
            "response_rate": {"type": "number"}
          }
        }
      }
    },
    "moderation_flags": {
      "type": "object",
      "properties": {
        "is_flagged": {"type": "boolean"},
        "spam_likelihood": {"type": "number"},
        "harassment_likelihood": {"type": "number"},
        "quality_score": {"type": "number"}
      }
    },
    "visibility_multiplier": {
      "type": "number",
      "default": 1.0,
      "description": "Applied to discovery visibility (not feed ranking)"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "calculated_by": {"type": "string"},
        "next_recalc": {"type": "string", "format": "date-time"}
      }
    }
  },
  "required": ["creator_email", "score", "scored_at"]
}
```

---

## HOOK DESIGN: useDiscoveryMetrics

**Location:** `hooks/useDiscoveryMetrics.js` (To be implemented in Phase Two)

```javascript
/**
 * Hook: useDiscoveryMetrics
 * Passively tracks user engagement metrics for future discovery scoring.
 * Does NOT rank or optimize content. Only collects data.
 */

export function useDiscoveryMetrics() {
  const { user } = useAuth();

  // Track when user saves a post
  const handleSave = useCallback((post) => {
    if (!user) return;
    // Fire-and-forget logging
    base44.analytics.track({
      eventName: 'discovery_save',
      properties: { post_id: post.id, creator_email: post.created_by }
    });
  }, [user]);

  // Track meaningful comments (>5 chars)
  const handleComment = useCallback((post, commentText) => {
    if (!user || commentText.length < 5) return;
    base44.analytics.track({
      eventName: 'discovery_meaningful_comment',
      properties: { 
        post_id: post.id, 
        creator_email: post.created_by,
        comment_length: commentText.length
      }
    });
  }, [user]);

  // Track profile visits
  const handleVisitProfile = useCallback((creatorEmail) => {
    if (!user) return;
    base44.analytics.track({
      eventName: 'discovery_profile_visit',
      properties: { creator_email: creatorEmail }
    });
  }, [user]);

  // Track sharing/reposting
  const handleShare = useCallback((post) => {
    if (!user) return;
    base44.analytics.track({
      eventName: 'discovery_share',
      properties: { post_id: post.id, creator_email: post.created_by }
    });
  }, [user]);

  return {
    onSave: handleSave,
    onComment: handleComment,
    onProfileVisit: handleVisitProfile,
    onShare: handleShare
  };
}
```

---

## SCORING CALCULATION FUNCTIONS

**Location:** `utils/discoveryScoring.js` (To be implemented in Phase Two)

```javascript
/**
 * Authenticity Score: Rewards consistent creators
 * NOT gamed by frequency posting, rewards tenure
 */
export function calculateAuthenticityScore(creator) {
  const daysSinceCreated = 
    (new Date() - new Date(creator.created_date)) / (1000 * 60 * 60 * 24);
  
  const consistencyBonus = Math.min(daysSinceCreated / 365, 1.0); // Cap at 1.0
  const tenureBonus = Math.min(creator.community_tenure_months / 12, 1.0);
  
  const baseScore = (consistencyBonus + tenureBonus) / 2;
  return baseScore * 100; // 0–100
}

/**
 * Cultural Resonance: Rewards community-relevant content
 * Explicit signals: saves, comments, shares, mentions
 */
export function calculateCulturalResonance(post) {
  const saves = post.saves_count || 0;
  const comments = post.meaningful_comments_count || 0;
  const shares = post.shares_from_community || 0;
  const mentions = post.community_mentions || 0;
  
  // Weighted signals: saves > comments > shares > mentions
  const score = (
    (saves * 5) +
    (comments * 3) +
    (shares * 2) +
    (mentions * 1)
  ) / 11; // Normalize
  
  return Math.min(score, 100);
}

/**
 * Anti-Spam: Detects and penalizes spam behavior
 */
export function calculateAntiSpamScore(creator) {
  const postingVelocity = creator.posts_last_hour || 0;
  const reportCount = creator.report_count || 0;
  const hashtagSpam = detectHashtagSpamming(creator);
  
  let penalty = 0;
  if (postingVelocity > 5) penalty += 30; // Burst detection
  if (reportCount > 0) penalty += (reportCount * 10);
  if (hashtagSpam) penalty += 20;
  
  return Math.max(100 - penalty, 0);
}

/**
 * Engagement Quality: Rewards thoughtful interaction
 */
export function calculateEngagementQuality(creator) {
  const avgCommentLength = creator.avg_comment_chars || 0;
  const conversationInitiated = creator.conversations_started || 0;
  const responseRate = creator.response_rate || 0;
  
  const depthScore = Math.min(avgCommentLength / 100, 1.0); // 100+ chars = thoughtful
  const conversationScore = Math.min(conversationInitiated / 10, 1.0);
  
  const baseScore = (depthScore + conversationScore + responseRate) / 3;
  return baseScore * 100;
}
```

---

## DISCOVERY UI ARCHITECTURE (NOT IMPLEMENTED YET)

### Proposed Discovery Sections (Not Infinite Feed)

**All Sections Profile-Centric, Not Feed-Optimized:**

1. **Creator Spotlights**
   - Manual editorial picks + score-informed suggestions
   - 5–10 creators rotated weekly
   - Profile → full creator portfolio

2. **Rising Creators**
   - Consistent performers over 90 days
   - Score: High authenticity + cultural resonance
   - No short-term spike gaming

3. **Community Picks**
   - Community voting (saves, shares)
   - Not algorithmic, explicit curation
   - Prevents hidden voting manipulation

4. **Drops & Collections**
   - Editorial themes + limited releases
   - High intentionality (not infinite scroll)
   - Creator-driven collections

**What's NOT Included:**
- ❌ Algorithmic "For You" feed
- ❌ Personalization based on scroll patterns
- ❌ Infinite scroll optimization
- ❌ Engagement-farming ranking

---

## WHAT THIS FOUNDATION ENABLES (FUTURE)

### Phase Two Expansion
- [ ] ML-based spam detection (uses anti_spam layer)
- [ ] Creator quality gates (uses authenticity scores)
- [ ] Community moderation automation (uses moderation_flags)
- [ ] Visibility multiplier application in discovery sections

### Phase Three+ Potential
- [ ] Advanced cultural resonance modeling
- [ ] Cross-collection content discovery
- [ ] Creator mentorship program (based on authenticity)
- [ ] Community curation rewards system

---

## WHAT THIS FOUNDATION PREVENTS (INTENTIONAL)

### No Addictive Mechanics
- ❌ No infinite feed optimization
- ❌ No dopamine-triggered ranking
- ❌ No hidden algorithmic preference learning
- ❌ No engagement farming rewards

### Philosophy Preservation
- ✅ Creator identity remains central
- ✅ Community remains peer-driven
- ✅ Authenticity > virality
- ✅ Intentional engagement > addiction

---

## IMPLEMENTATION CHECKLIST (PHASE TWO)

- [ ] Create `entities/DiscoveryScore.json` schema
- [ ] Implement `hooks/useDiscoveryMetrics.js` for data collection
- [ ] Implement scoring functions in `utils/discoveryScoring.js`
- [ ] Create backend automation to recalculate scores (weekly)
- [ ] Design & implement Discovery UI sections (not feed)
- [ ] Add moderation flagging system
- [ ] Create admin discovery analytics dashboard
- [ ] Document scoring algorithm transparency
- [ ] Implement community transparency (creators can see scores)

---

## VALIDATION CHECKPOINT

| Requirement | Status | Notes |
|-------------|--------|-------|
| Clean data structure exists | ✅ PASS | DiscoveryScore entity designed |
| Modular for future inputs | ✅ PASS | Authenticity, resonance, anti-spam, quality all separate |
| No addictive mechanics | ✅ PASS | No infinite scroll, no dopamine optimization |
| Creator identity central | ✅ PASS | All discovery routes to creator profiles |
| Moderation hooks ready | ✅ PASS | Anti-spam, flags, harassment detection prepared |
| Aligns with Enigma philosophy | ✅ PASS | Authenticity > virality, consistency > spam |

**Discovery Foundation: READY FOR PHASE TWO IMPLEMENTATION** ✅

---

## CONCLUSION

**Discovery Architecture: CLEAN, MODULAR, PHILOSOPHY-ALIGNED.**

Foundation is designed to support future controlled discovery system that:
- Rewards authenticity and consistency
- Prevents spam and harassment
- Keeps creator identity central
- Maintains intentional UX (not addictive)
- Enables transparent, modular scoring

Architecture is ready for Phase Two implementation.

**End of Report**