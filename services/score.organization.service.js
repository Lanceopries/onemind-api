const maxScoreForPoint = 10;

/**
 * 
 * @param {Number} countOfParameters 
 * @returns 
 */
module.exports.getMaxCountOfScore = async function (countOfParameters){
    return countOfParameters * maxScoreForPoint;
}

/**
 * 
 * @param {Date} dateFrom 
 */
 module.exports.getScoreForWorkPeriod = async function (dateFrom){
    const bestPeriodYears = 5;
    let yearsDiff =  new Date().getFullYear() - dateFrom.getFullYear();
    let score = yearsDiff * maxScoreForPoint / bestPeriodYears;
    if(score > maxScoreForPoint){
        score = maxScoreForPoint;
    }
    return score;
}

/**
 * 
 * @param {Number} countSocialLinks 
 */
 module.exports.getScoreForSocialLinks = async function (countSocialLinks){
    const bestCountLinks = 3;
    let score = countSocialLinks * maxScoreForPoint / bestCountLinks;
    if(score > maxScoreForPoint){
        score = maxScoreForPoint;
    }
    return score;
}

/**
 * 
 * @param {Number} countFssp 
 */
 module.exports.getScoreForFssp = async function (countFssp){
    const bestCount = 3;
    let score = countFssp * maxScoreForPoint / bestCount;
    if(score > maxScoreForPoint){
        score = maxScoreForPoint;
    }
    return maxScoreForPoint - score;
}

module.exports.getMaxAmountCredit = async function (amountCapital, risksPercent, dynamicGrowPercent){
    let riskOffCapital = amountCapital * (1 - risksPercent/100);
    let dynamicBonus = riskOffCapital * (dynamicGrowPercent / 100);
    return Math.trunc(riskOffCapital + dynamicBonus);
}

module.exports.getVerdict = async function (scoreReliability){
    if(scoreReliability < 50){
        return "Ненадежно";
    }
    if(scoreReliability < 70){
        return "Хорошо";
    }
    return "Отлично";
}