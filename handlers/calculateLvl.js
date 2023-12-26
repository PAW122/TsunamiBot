module.exports = (xp) => {
    // XP required to level up
    const xpToLevelUp = (level) => level * 100; // Adjust this formula as needed

    // Find the current level
    let level = 1;
    let remainingXP = xp;
    while (remainingXP >= xpToLevelUp(level)) {
        remainingXP -= xpToLevelUp(level);
        level++;
    }

    return {
        level: level,
        remainingXP: remainingXP,
        NextLevel: xpToLevelUp(level),
    };
};