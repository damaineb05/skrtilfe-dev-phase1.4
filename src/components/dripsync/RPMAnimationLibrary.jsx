// Ready Player Me Animation Library
// Source: https://github.com/FilamentGames/rpm-animation-library

const BASE_URL = 'https://raw.githubusercontent.com/readyplayerme/animation-library/master';

// GLB animations from the official RPM library
export const RPM_ANIMATIONS = {
  locomotion: [
    // Masculine Locomotion
    { name: 'Idle', slug: 'M_Idle_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Idle_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Walk', slug: 'M_Walk_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Walk_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Walk Backwards', slug: 'M_Walk_Backwards_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Walk_Backwards_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Jog', slug: 'M_Jog_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Jog_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Jog Backwards', slug: 'M_Jog_Backwards_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Jog_Backwards_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Jog Strafe Left', slug: 'M_Jog_Strafe_Left_002', url: `${BASE_URL}/masculine/glb/locomotion/M_Jog_Strafe_Left_002.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Jog Strafe Right', slug: 'M_Jog_Strafe_Right_002', url: `${BASE_URL}/masculine/glb/locomotion/M_Jog_Strafe_Right_002.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Jog Jump', slug: 'M_Jog_Jump_Small_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Jog_Jump_Small_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Run', slug: 'M_Run_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Run_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Run Backwards', slug: 'M_Run_Backwards_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Run_Backwards_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Run Jump', slug: 'M_Run_Jump_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Run_Jump_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Run Strafe Left', slug: 'M_Run_Strafe_Left_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Run_Strafe_Left_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Run Strafe Right', slug: 'M_Run_Strafe_Right_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Run_Strafe_Right_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Crouch Idle', slug: 'M_Crouch_Idle_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Crouch_Idle_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Crouch Walk', slug: 'M_Crouch_Walk_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Crouch_Walk_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Crouch Walk Backwards', slug: 'M_CrouchedWalk_Backwards_001', url: `${BASE_URL}/masculine/glb/locomotion/M_CrouchedWalk_Backwards_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Crouch Strafe Left', slug: 'M_Crouch_Strafe_Left', url: `${BASE_URL}/masculine/glb/locomotion/M_Crouch_Strafe_Left.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Crouch Strafe Right', slug: 'M_Crouch_Strafe_Right', url: `${BASE_URL}/masculine/glb/locomotion/M_Crouch_Strafe_Right.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Falling Idle', slug: 'M_Falling_Idle_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Falling_Idle_001.glb`, category: 'locomotion', gender: 'M' },
    { name: 'Standing Jump', slug: 'M_Standing_Jump_001', url: `${BASE_URL}/masculine/glb/locomotion/M_Standing_Jump_001.glb`, category: 'locomotion', gender: 'M' },
    
    // Feminine Locomotion
    { name: 'Idle (F)', slug: 'F_Idle_001', url: `${BASE_URL}/feminine/glb/locomotion/F_Idle_001.glb`, category: 'locomotion', gender: 'F' },
    { name: 'Walk (F)', slug: 'F_Walk_001', url: `${BASE_URL}/feminine/glb/locomotion/F_Walk_001.glb`, category: 'locomotion', gender: 'F' },
    { name: 'Jog (F)', slug: 'F_Jog_001', url: `${BASE_URL}/feminine/glb/locomotion/F_Jog_001.glb`, category: 'locomotion', gender: 'F' },
    { name: 'Run (F)', slug: 'F_Run_001', url: `${BASE_URL}/feminine/glb/locomotion/F_Run_001.glb`, category: 'locomotion', gender: 'F' },
  ],
  
  dance: [
    // Masculine Dances
    { name: 'Dance 1', slug: 'M_Dances_001', url: `${BASE_URL}/masculine/glb/dance/M_Dances_001.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 2', slug: 'M_Dances_002', url: `${BASE_URL}/masculine/glb/dance/M_Dances_002.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 3', slug: 'M_Dances_003', url: `${BASE_URL}/masculine/glb/dance/M_Dances_003.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 4', slug: 'M_Dances_004', url: `${BASE_URL}/masculine/glb/dance/M_Dances_004.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 5', slug: 'M_Dances_005', url: `${BASE_URL}/masculine/glb/dance/M_Dances_005.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 6', slug: 'M_Dances_006', url: `${BASE_URL}/masculine/glb/dance/M_Dances_006.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 7', slug: 'M_Dances_007', url: `${BASE_URL}/masculine/glb/dance/M_Dances_007.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 8', slug: 'M_Dances_008', url: `${BASE_URL}/masculine/glb/dance/M_Dances_008.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 9', slug: 'M_Dances_009', url: `${BASE_URL}/masculine/glb/dance/M_Dances_009.glb`, category: 'dance', gender: 'M' },
    { name: 'Dance 11', slug: 'M_Dances_011', url: `${BASE_URL}/masculine/glb/dance/M_Dances_011.glb`, category: 'dance', gender: 'M' },
    
    // Feminine Dances
    { name: 'Dance 1 (F)', slug: 'F_Dances_001', url: `${BASE_URL}/feminine/glb/dance/F_Dances_001.glb`, category: 'dance', gender: 'F' },
    { name: 'Dance 4 (F)', slug: 'F_Dances_004', url: `${BASE_URL}/feminine/glb/dance/F_Dances_004.glb`, category: 'dance', gender: 'F' },
    { name: 'Dance 5 (F)', slug: 'F_Dances_005', url: `${BASE_URL}/feminine/glb/dance/F_Dances_005.glb`, category: 'dance', gender: 'F' },
    { name: 'Dance 6 (F)', slug: 'F_Dances_006', url: `${BASE_URL}/feminine/glb/dance/F_Dances_006.glb`, category: 'dance', gender: 'F' },
    { name: 'Dance 7 (F)', slug: 'F_Dances_007', url: `${BASE_URL}/feminine/glb/dance/F_Dances_007.glb`, category: 'dance', gender: 'F' },
  ],
  
  idle: [
    // Masculine Idle Variations
    { name: 'Standing Idle 1', slug: 'M_Standing_Idle_001', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_001.glb`, category: 'idle', gender: 'M' },
    { name: 'Standing Idle 2', slug: 'M_Standing_Idle_002', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_002.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 1', slug: 'M_Standing_Idle_Variations_001', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_001.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 2', slug: 'M_Standing_Idle_Variations_002', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_002.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 3', slug: 'M_Standing_Idle_Variations_003', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_003.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 4', slug: 'M_Standing_Idle_Variations_004', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_004.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 5', slug: 'M_Standing_Idle_Variations_005', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_005.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 6', slug: 'M_Standing_Idle_Variations_006', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_006.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 7', slug: 'M_Standing_Idle_Variations_007', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_007.glb`, category: 'idle', gender: 'M' },
    { name: 'Idle Variation 8', slug: 'M_Standing_Idle_Variations_008', url: `${BASE_URL}/masculine/glb/idle/M_Standing_Idle_Variations_008.glb`, category: 'idle', gender: 'M' },
    
    // Feminine Idle Variations
    { name: 'Standing Idle 1 (F)', slug: 'F_Standing_Idle_001', url: `${BASE_URL}/feminine/glb/idle/F_Standing_Idle_001.glb`, category: 'idle', gender: 'F' },
    { name: 'Idle Variation 1 (F)', slug: 'F_Standing_Idle_Variations_001', url: `${BASE_URL}/feminine/glb/idle/F_Standing_Idle_Variations_001.glb`, category: 'idle', gender: 'F' },
    { name: 'Idle Variation 2 (F)', slug: 'F_Standing_Idle_Variations_002', url: `${BASE_URL}/feminine/glb/idle/F_Standing_Idle_Variations_002.glb`, category: 'idle', gender: 'F' },
    { name: 'Idle Variation 3 (F)', slug: 'F_Standing_Idle_Variations_003', url: `${BASE_URL}/feminine/glb/idle/F_Standing_Idle_Variations_003.glb`, category: 'idle', gender: 'F' },
    { name: 'Idle Variation 4 (F)', slug: 'F_Standing_Idle_Variations_004', url: `${BASE_URL}/feminine/glb/idle/F_Standing_Idle_Variations_004.glb`, category: 'idle', gender: 'F' },
    { name: 'Idle Variation 5 (F)', slug: 'F_Standing_Idle_Variations_005', url: `${BASE_URL}/feminine/glb/idle/F_Standing_Idle_Variations_005.glb`, category: 'idle', gender: 'F' },
  ],
  
  expression: [
    // Masculine Expressions
    { name: 'Expression 1', slug: 'M_Standing_Expressions_001', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_001.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 2', slug: 'M_Standing_Expressions_002', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_002.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 4', slug: 'M_Standing_Expressions_004', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_004.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 5', slug: 'M_Standing_Expressions_005', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_005.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 6', slug: 'M_Standing_Expressions_006', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_006.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 7', slug: 'M_Standing_Expressions_007', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_007.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 8', slug: 'M_Standing_Expressions_008', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_008.glb`, category: 'expression', gender: 'M' },
    { name: 'Expression 9', slug: 'M_Standing_Expressions_009', url: `${BASE_URL}/masculine/glb/expression/M_Standing_Expressions_009.glb`, category: 'expression', gender: 'M' },
    { name: 'Talking 1', slug: 'M_Talking_Variations_001', url: `${BASE_URL}/masculine/glb/expression/M_Talking_Variations_001.glb`, category: 'expression', gender: 'M' },
    { name: 'Talking 2', slug: 'M_Talking_Variations_002', url: `${BASE_URL}/masculine/glb/expression/M_Talking_Variations_002.glb`, category: 'expression', gender: 'M' },
    { name: 'Talking 3', slug: 'M_Talking_Variations_003', url: `${BASE_URL}/masculine/glb/expression/M_Talking_Variations_003.glb`, category: 'expression', gender: 'M' },
    { name: 'Talking 4', slug: 'M_Talking_Variations_004', url: `${BASE_URL}/masculine/glb/expression/M_Talking_Variations_004.glb`, category: 'expression', gender: 'M' },
    { name: 'Talking 5', slug: 'M_Talking_Variations_005', url: `${BASE_URL}/masculine/glb/expression/M_Talking_Variations_005.glb`, category: 'expression', gender: 'M' },
    
    // Feminine Expressions
    { name: 'Talking 1 (F)', slug: 'F_Talking_Variations_001', url: `${BASE_URL}/feminine/glb/expression/F_Talking_Variations_001.glb`, category: 'expression', gender: 'F' },
    { name: 'Talking 2 (F)', slug: 'F_Talking_Variations_002', url: `${BASE_URL}/feminine/glb/expression/F_Talking_Variations_002.glb`, category: 'expression', gender: 'F' },
    { name: 'Talking 3 (F)', slug: 'F_Talking_Variations_003', url: `${BASE_URL}/feminine/glb/expression/F_Talking_Variations_003.glb`, category: 'expression', gender: 'F' },
    { name: 'Talking 4 (F)', slug: 'F_Talking_Variations_004', url: `${BASE_URL}/feminine/glb/expression/F_Talking_Variations_004.glb`, category: 'expression', gender: 'F' },
    { name: 'Talking 5 (F)', slug: 'F_Talking_Variations_005', url: `${BASE_URL}/feminine/glb/expression/F_Talking_Variations_005.glb`, category: 'expression', gender: 'F' },
    { name: 'Talking 6 (F)', slug: 'F_Talking_Variations_006', url: `${BASE_URL}/feminine/glb/expression/F_Talking_Variations_006.glb`, category: 'expression', gender: 'F' },
  ],
};

// Get all animations flattened
export const getAllAnimations = () => {
  return [
    ...RPM_ANIMATIONS.locomotion,
    ...RPM_ANIMATIONS.dance,
    ...RPM_ANIMATIONS.idle,
    ...RPM_ANIMATIONS.expression,
  ];
};

// Get animations by category
export const getAnimationsByCategory = (category) => {
  return RPM_ANIMATIONS[category] || [];
};

// Get animations by gender
export const getAnimationsByGender = (gender) => {
  return getAllAnimations().filter(a => a.gender === gender);
};

// Category metadata for UI
export const ANIMATION_CATEGORIES = [
  { id: 'locomotion', name: 'Locomotion', icon: '🏃', description: 'Walking, running, jumping' },
  { id: 'dance', name: 'Dance', icon: '💃', description: 'Dance moves and grooves' },
  { id: 'idle', name: 'Idle', icon: '🧍', description: 'Standing and idle variations' },
  { id: 'expression', name: 'Expression', icon: '😀', description: 'Talking and emoting' },
];

export default RPM_ANIMATIONS;