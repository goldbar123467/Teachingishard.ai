/**
 * Post Templates for Social Feed
 * Authentic 5th-grade voice patterns organized by category
 */

export interface PostTemplate {
  id: string;
  category: 'social' | 'academic' | 'humor' | 'drama' | 'personal' | 'event';
  content: string;
  variables: string[]; // e.g., ['friend', 'teacher', 'score']
  personalities: string[]; // Which personality types would use this
  moodRequired?: 'happy' | 'sad' | 'excited' | 'angry' | 'tired';
}

export const POST_TEMPLATES: PostTemplate[] = [
  // SOCIAL POSTS (15 templates)
  {
    id: 'social_shoutout_1',
    category: 'social',
    content: '{{ friend }} is literally the best friend ever!! 💕💕',
    variables: ['friend'],
    personalities: ['outgoing', 'popular', 'friendly'],
  },
  {
    id: 'social_shoutout_2',
    category: 'social',
    content: 'shoutout to {{ friend }} for always having my back 🙏',
    variables: ['friend'],
    personalities: ['outgoing', 'friendly', 'loyal'],
  },
  {
    id: 'social_lunch_1',
    category: 'social',
    content: 'lunch table literally has main character energy today fr fr 😎',
    variables: [],
    personalities: ['outgoing', 'popular', 'class_clown'],
  },
  {
    id: 'social_new_friend',
    category: 'social',
    content: 'omg {{ friend }} is actually so cool?? why didnt we hang out before 👀',
    variables: ['friend'],
    personalities: ['outgoing', 'friendly'],
  },
  {
    id: 'social_bestie_1',
    category: 'social',
    content: '{{ friend }} >>> everyone else no cap 💯',
    variables: ['friend'],
    personalities: ['outgoing', 'popular', 'loyal'],
  },
  {
    id: 'social_squad_1',
    category: 'social',
    content: 'my friend group is literally unmatched 😤✨',
    variables: [],
    personalities: ['outgoing', 'popular'],
  },
  {
    id: 'social_grateful_1',
    category: 'social',
    content: 'grateful for {{ friend }} being so real with me 💙',
    variables: ['friend'],
    personalities: ['friendly', 'thoughtful', 'loyal'],
  },
  {
    id: 'social_miss_1',
    category: 'social',
    content: '{{ friend }} is absent today and its so boring without them 😭',
    variables: ['friend'],
    personalities: ['outgoing', 'friendly'],
  },
  {
    id: 'social_recess_1',
    category: 'social',
    content: 'recess with {{ friend }} hit different today 🏀',
    variables: ['friend'],
    personalities: ['outgoing', 'athletic', 'friendly'],
  },
  {
    id: 'social_sleepover_1',
    category: 'social',
    content: 'sleepover at {{ friend }}s house this weekend LETS GOOO 🎉',
    variables: ['friend'],
    personalities: ['outgoing', 'popular', 'friendly'],
    moodRequired: 'excited',
  },
  {
    id: 'social_inside_joke',
    category: 'social',
    content: '{{ friend }} when i said the thing 💀💀 iykyk',
    variables: ['friend'],
    personalities: ['outgoing', 'class_clown', 'friendly'],
  },
  {
    id: 'social_duo_1',
    category: 'social',
    content: 'me and {{ friend }} are literally iconic 😌',
    variables: ['friend'],
    personalities: ['outgoing', 'popular'],
  },
  {
    id: 'social_thankful_1',
    category: 'social',
    content: 'ty {{ friend }} for helping me with the hw ur a real one 🙏',
    variables: ['friend'],
    personalities: ['friendly', 'grateful', 'studious'],
  },
  {
    id: 'social_quiet_appreciate',
    category: 'social',
    content: '{{ friend }} is really nice... glad we got paired together today',
    variables: ['friend'],
    personalities: ['shy', 'thoughtful'],
  },
  {
    id: 'social_fun_1',
    category: 'social',
    content: 'today was actually so fun?? {{ friend }} had me DYING 😂',
    variables: ['friend'],
    personalities: ['outgoing', 'friendly', 'class_clown'],
  },

  // ACADEMIC POSTS (15 templates)
  {
    id: 'academic_test_hard',
    category: 'academic',
    content: 'that test was BRUTAL 😭😭 {{ teacher }} why u do this to us',
    variables: ['teacher'],
    personalities: ['outgoing', 'dramatic', 'struggling'],
  },
  {
    id: 'academic_test_easy',
    category: 'academic',
    content: 'ok that test was lowkey easier than i thought 😅',
    variables: [],
    personalities: ['studious', 'confident', 'smart'],
  },
  {
    id: 'academic_flex_1',
    category: 'academic',
    content: '{{ score }}% on the test!! SLAY 💅✨',
    variables: ['score'],
    personalities: ['outgoing', 'popular', 'smart', 'confident'],
    moodRequired: 'excited',
  },
  {
    id: 'academic_homework_1',
    category: 'academic',
    content: 'WHY SO MUCH HOMEWORK?? my hand literally hurts 😩',
    variables: [],
    personalities: ['outgoing', 'dramatic', 'struggling', 'class_clown'],
  },
  {
    id: 'academic_homework_2',
    category: 'academic',
    content: 'homework is actually pointless like when am i gonna use this irl 🙄',
    variables: [],
    personalities: ['rebellious', 'struggling', 'class_clown'],
  },
  {
    id: 'academic_subject_hate',
    category: 'academic',
    content: '{{ subject }} is literally my villain origin story 😤',
    variables: ['subject'],
    personalities: ['dramatic', 'struggling', 'class_clown'],
  },
  {
    id: 'academic_subject_love',
    category: 'academic',
    content: '{{ subject }} is actually kinda interesting ngl 🤔',
    variables: ['subject'],
    personalities: ['curious', 'studious', 'smart'],
  },
  {
    id: 'academic_confused_1',
    category: 'academic',
    content: 'wait can someone explain {{ topic }} to me?? so lost rn 😵‍💫',
    variables: ['topic'],
    personalities: ['struggling', 'friendly', 'honest'],
  },
  {
    id: 'academic_understand_1',
    category: 'academic',
    content: 'OHHH i finally get {{ topic }} it makes sense now!!',
    variables: ['topic'],
    personalities: ['curious', 'studious', 'excited'],
    moodRequired: 'excited',
  },
  {
    id: 'academic_project_1',
    category: 'academic',
    content: 'this project is actually so cool im having fun with it 😊',
    variables: [],
    personalities: ['creative', 'studious', 'curious'],
  },
  {
    id: 'academic_project_stress',
    category: 'academic',
    content: 'project due tomorrow and i havent even started 💀 wish me luck',
    variables: [],
    personalities: ['distracted', 'procrastinator', 'class_clown'],
  },
  {
    id: 'academic_reading_1',
    category: 'academic',
    content: 'this book were reading is actually really good 📚',
    variables: [],
    personalities: ['curious', 'studious', 'thoughtful', 'shy'],
  },
  {
    id: 'academic_boring_1',
    category: 'academic',
    content: '{{ subject }} class feels like it takes 5 hours 😴',
    variables: ['subject'],
    personalities: ['distracted', 'class_clown', 'struggling'],
  },
  {
    id: 'academic_partner_1',
    category: 'academic',
    content: 'got paired with {{ friend }} for the project LETS GO 🎉',
    variables: ['friend'],
    personalities: ['outgoing', 'friendly'],
  },
  {
    id: 'academic_tryhard_1',
    category: 'academic',
    content: 'studied so hard for this test it better pay off 📝',
    variables: [],
    personalities: ['studious', 'determined', 'perfectionist'],
  },

  // HUMOR POSTS (15 templates)
  {
    id: 'humor_meme_1',
    category: 'humor',
    content: '{{ situation }} 💀💀💀 i cant',
    variables: ['situation'],
    personalities: ['class_clown', 'outgoing', 'popular'],
  },
  {
    id: 'humor_teacher_1',
    category: 'humor',
    content: 'when {{ teacher }} tries to be relatable 😭 bro just teach',
    variables: ['teacher'],
    personalities: ['class_clown', 'rebellious', 'outgoing'],
  },
  {
    id: 'humor_self_roast_1',
    category: 'humor',
    content: 'literally me: {{ embarrassing_thing }} in front of everyone 💀',
    variables: ['embarrassing_thing'],
    personalities: ['class_clown', 'outgoing', 'self_deprecating'],
  },
  {
    id: 'humor_braincell_1',
    category: 'humor',
    content: 'MY BRAINCELL JUST LEFT THE BUILDING 🧠❌',
    variables: [],
    personalities: ['class_clown', 'distracted', 'outgoing'],
  },
  {
    id: 'humor_tired_1',
    category: 'humor',
    content: 'running on 2 hours of sleep and a dream 😵',
    variables: [],
    personalities: ['class_clown', 'distracted', 'relatable'],
    moodRequired: 'tired',
  },
  {
    id: 'humor_random_1',
    category: 'humor',
    content: 'why is {{ random_thing }} even a thing?? like who decided that 🤨',
    variables: ['random_thing'],
    personalities: ['class_clown', 'curious', 'quirky'],
  },
  {
    id: 'humor_lunch_1',
    category: 'humor',
    content: 'cafeteria food hits different when youre starving 🍕 (still mid tho)',
    variables: [],
    personalities: ['class_clown', 'outgoing', 'relatable'],
  },
  {
    id: 'humor_monday_1',
    category: 'humor',
    content: 'mondays should be illegal thats just facts 📠',
    variables: [],
    personalities: ['class_clown', 'relatable', 'tired'],
  },
  {
    id: 'humor_attention_1',
    category: 'humor',
    content: 'my attention span is literally this 🤏 small',
    variables: [],
    personalities: ['class_clown', 'distracted', 'honest'],
  },
  {
    id: 'humor_vibe_1',
    category: 'humor',
    content: 'the vibes today are NOT it 😤',
    variables: [],
    personalities: ['class_clown', 'dramatic', 'outgoing'],
  },
  {
    id: 'humor_mood_1',
    category: 'humor',
    content: 'my mood changes every 5 seconds i need help 😂',
    variables: [],
    personalities: ['class_clown', 'dramatic', 'chaotic'],
  },
  {
    id: 'humor_teacher_mood',
    category: 'humor',
    content: '{{ teacher }} woke up and chose chaos today 💀',
    variables: ['teacher'],
    personalities: ['class_clown', 'outgoing', 'observant'],
  },
  {
    id: 'humor_struggle_1',
    category: 'humor',
    content: 'why is being a student literally so hard 😭 adulting gonna be worse',
    variables: [],
    personalities: ['class_clown', 'dramatic', 'relatable'],
  },
  {
    id: 'humor_energy_1',
    category: 'humor',
    content: 'i have ZERO energy rn someone send help ☠️',
    variables: [],
    personalities: ['class_clown', 'tired', 'dramatic'],
    moodRequired: 'tired',
  },
  {
    id: 'humor_savage_1',
    category: 'humor',
    content: 'im not saying {{ thing }} but im just saying {{ thing }} 👀',
    variables: ['thing'],
    personalities: ['class_clown', 'sassy', 'bold'],
  },

  // DRAMA POSTS (12 templates)
  {
    id: 'drama_subtweet_1',
    category: 'drama',
    content: 'some people really think they can treat others like that 🙄',
    variables: [],
    personalities: ['dramatic', 'popular', 'sensitive'],
  },
  {
    id: 'drama_subtweet_2',
    category: 'drama',
    content: 'the way certain people act is honestly embarrassing 😬',
    variables: [],
    personalities: ['dramatic', 'sassy', 'bold'],
  },
  {
    id: 'drama_callout_1',
    category: 'drama',
    content: 'the way you were being so rude is NOT it 😒',
    variables: [],
    personalities: ['dramatic', 'bold', 'confrontational'],
  },
  {
    id: 'drama_gossip_1',
    category: 'drama',
    content: 'okay but did you HEAR about what happened today?? 👀☕',
    variables: [],
    personalities: ['dramatic', 'popular', 'outgoing'],
  },
  {
    id: 'drama_cryptic_1',
    category: 'drama',
    content: 'i could say something but i wont. you know who you are.',
    variables: [],
    personalities: ['dramatic', 'passive_aggressive', 'popular'],
  },
  {
    id: 'drama_cryptic_2',
    category: 'drama',
    content: 'if you know you know 👁️👄👁️',
    variables: [],
    personalities: ['dramatic', 'mysterious', 'popular'],
  },
  {
    id: 'drama_fake_1',
    category: 'drama',
    content: 'fake friends are worse than no friends periodt 💅',
    variables: [],
    personalities: ['dramatic', 'loyal', 'hurt'],
    moodRequired: 'angry',
  },
  {
    id: 'drama_trust_1',
    category: 'drama',
    content: 'trust is earned not given remember that 😤',
    variables: [],
    personalities: ['dramatic', 'wise', 'hurt'],
  },
  {
    id: 'drama_annoyed_1',
    category: 'drama',
    content: 'some people need to mind their business fr 🙄',
    variables: [],
    personalities: ['dramatic', 'private', 'annoyed'],
  },
  {
    id: 'drama_over_it',
    category: 'drama',
    content: 'im so over the drama honestly 😮‍💨',
    variables: [],
    personalities: ['dramatic', 'tired', 'mature'],
  },
  {
    id: 'drama_confrontation',
    category: 'drama',
    content: 'we need to talk. you know what you did.',
    variables: [],
    personalities: ['dramatic', 'bold', 'direct'],
  },
  {
    id: 'drama_energy_1',
    category: 'drama',
    content: 'the negative energy today is crazy im staying away 🚫',
    variables: [],
    personalities: ['dramatic', 'sensitive', 'self_protective'],
  },

  // PERSONAL POSTS (12 templates)
  {
    id: 'personal_bad_day',
    category: 'personal',
    content: 'literally having the worst day ever 😔',
    variables: [],
    personalities: ['dramatic', 'emotional', 'honest'],
    moodRequired: 'sad',
  },
  {
    id: 'personal_good_day',
    category: 'personal',
    content: 'today was actually really good 😊 needed this',
    variables: [],
    personalities: ['positive', 'grateful', 'friendly'],
    moodRequired: 'happy',
  },
  {
    id: 'personal_excited_1',
    category: 'personal',
    content: 'OMG THE WEEKEND IS LITERALLY RIGHT THERE 🎉',
    variables: [],
    personalities: ['outgoing', 'excited', 'positive'],
    moodRequired: 'excited',
  },
  {
    id: 'personal_tired_1',
    category: 'personal',
    content: 'so tired i can barely keep my eyes open 😴',
    variables: [],
    personalities: ['honest', 'tired', 'relatable'],
    moodRequired: 'tired',
  },
  {
    id: 'personal_grateful_1',
    category: 'personal',
    content: 'feeling really blessed today 💕',
    variables: [],
    personalities: ['grateful', 'positive', 'thoughtful'],
    moodRequired: 'happy',
  },
  {
    id: 'personal_mood_1',
    category: 'personal',
    content: 'in such a good mood rn nothing can bring me down 😌',
    variables: [],
    personalities: ['positive', 'confident', 'happy'],
    moodRequired: 'happy',
  },
  {
    id: 'personal_stressed_1',
    category: 'personal',
    content: 'feeling stressed lately ngl 😰',
    variables: [],
    personalities: ['honest', 'anxious', 'overwhelmed'],
  },
  {
    id: 'personal_bored_1',
    category: 'personal',
    content: 'im so bored someone text me 📱',
    variables: [],
    personalities: ['outgoing', 'social', 'bored'],
  },
  {
    id: 'personal_happy_1',
    category: 'personal',
    content: 'smiling for no reason today 😁',
    variables: [],
    personalities: ['positive', 'happy', 'bubbly'],
    moodRequired: 'happy',
  },
  {
    id: 'personal_quiet_1',
    category: 'personal',
    content: 'just want a quiet day today...',
    variables: [],
    personalities: ['shy', 'introverted', 'tired'],
  },
  {
    id: 'personal_motivated_1',
    category: 'personal',
    content: 'feeling motivated to actually try today lets see how long it lasts 💪',
    variables: [],
    personalities: ['determined', 'honest', 'self_aware'],
  },
  {
    id: 'personal_overthinking',
    category: 'personal',
    content: 'why do i overthink everything 🤔😅',
    variables: [],
    personalities: ['anxious', 'thoughtful', 'self_aware'],
  },

  // EVENT REACTION POSTS (10 templates)
  {
    id: 'event_fire_drill',
    category: 'event',
    content: 'FIRE DRILL?? in the middle of {{ subject }}?? the TIMING 💀💀',
    variables: ['subject'],
    personalities: ['outgoing', 'class_clown', 'dramatic'],
  },
  {
    id: 'event_quiz_1',
    category: 'event',
    content: 'SURPRISE QUIZ?? you CANNOT be serious rn 😭😭😭',
    variables: [],
    personalities: ['dramatic', 'unprepared', 'outgoing'],
  },
  {
    id: 'event_field_trip',
    category: 'event',
    content: 'FIELD TRIP TOMORROW IM HYPED 🎉🎉🎉',
    variables: [],
    personalities: ['outgoing', 'excited', 'positive'],
    moodRequired: 'excited',
  },
  {
    id: 'event_assembly_1',
    category: 'event',
    content: 'assembly means no math class LETS GOOOO 🙌',
    variables: [],
    personalities: ['class_clown', 'rebellious', 'strategic'],
  },
  {
    id: 'event_substitute_1',
    category: 'event',
    content: 'we have a sub today this gonna be chaotic 😈',
    variables: [],
    personalities: ['class_clown', 'mischievous', 'outgoing'],
  },
  {
    id: 'event_holiday_1',
    category: 'event',
    content: '{{ holiday }} break is SO CLOSE i can taste it 🎊',
    variables: ['holiday'],
    personalities: ['outgoing', 'excited', 'impatient'],
    moodRequired: 'excited',
  },
  {
    id: 'event_party_1',
    category: 'event',
    content: 'class party today!! {{ teacher }} brought the good snacks 🍪',
    variables: ['teacher'],
    personalities: ['outgoing', 'excited', 'food_motivated'],
  },
  {
    id: 'event_weather_1',
    category: 'event',
    content: 'its so nice outside why are we stuck inside 😭☀️',
    variables: [],
    personalities: ['outdoorsy', 'restless', 'athletic'],
  },
  {
    id: 'event_snow_day',
    category: 'event',
    content: 'SNOW DAY MANIFESTATION CIRCLE 🕯️❄️🕯️',
    variables: [],
    personalities: ['outgoing', 'hopeful', 'playful'],
  },
  {
    id: 'event_birthday_1',
    category: 'event',
    content: 'ITS MY BIRTHDAY MONTH 🎂✨ (in {{ days }} days)',
    variables: ['days'],
    personalities: ['outgoing', 'attention_seeking', 'excited'],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PostTemplate['category']): PostTemplate[] {
  return POST_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by personality
 */
export function getTemplatesByPersonality(personality: string): PostTemplate[] {
  return POST_TEMPLATES.filter(t => t.personalities.includes(personality));
}

/**
 * Get templates matching personality and mood
 */
export function getTemplatesByPersonalityAndMood(
  personality: string,
  mood?: 'happy' | 'sad' | 'excited' | 'angry' | 'tired'
): PostTemplate[] {
  return POST_TEMPLATES.filter(t => {
    const matchesPersonality = t.personalities.includes(personality);
    const matchesMood = !mood || !t.moodRequired || t.moodRequired === mood;
    return matchesPersonality && matchesMood;
  });
}

/**
 * Get a random template from a filtered set
 */
export function getRandomTemplate(templates: PostTemplate[]): PostTemplate | null {
  if (templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
}
