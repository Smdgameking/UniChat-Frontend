const SPECIAL_CHAR_REGEX = new RegExp('[!@#$%^&*()_+\\-=[\\[\\]{};\'"\\\\|,.<>\\/]');

const REQUIREMENTS = {
    length: { min: 8, check: (password) => password.length >= 8 },
    uppercase: { regex: /[A-Z]/, check: (password) => /[A-Z]/.test(password) },
    lowercase: { check: (password) => /[a-z]/.test(password) },
    number: { check: (password) => /\d/.test(password) },
    specialChar: { check: (password) => SPECIAL_CHAR_REGEX.test(password) }
};

function getMissingRequirements(password) {
    return {
        length: !REQUIREMENTS.length.check(password),
        uppercase: !REQUIREMENTS.uppercase.check(password),
        lowercase: !REQUIREMENTS.lowercase.check(password),
        number: !REQUIREMENTS.number.check(password),
        specialChar: !REQUIREMENTS.specialChar.check(password)
    };
}

function calculateScore(password) {
    if (!password) return 0;
    const checks = Object.keys(REQUIREMENTS);
    return checks.filter((key) => REQUIREMENTS[key].check(password)).length;
}

function getLevel(score) {
    if (score <= 1) return "weak";
    if (score === 2) return "fair";
    if (score === 3) return "good";
    return "strong";
}

function getLabel(level) {
    const labels = {
        weak: "Weak",
        fair: "Fair",
        good: "Good",
        strong: "Strong"
    };
    return labels[level] || "Weak";
}

function checkPasswordStrength(password) {
    const score = calculateScore(password);
    const level = getLevel(score);
    return {
        score,
        level,
        label: getLabel(level),
        requirements: getMissingRequirements(password)
    };
}

export {
    checkPasswordStrength,
    getMissingRequirements,
    REQUIREMENTS
};
