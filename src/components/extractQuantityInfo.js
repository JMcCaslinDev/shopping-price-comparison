function extractQuantityInfo(item) {
  const fields = [item.name, item.shortDescription, item.longDescription];
  let containerCount = 0;
  let unitCount = 0;
  let totalCount = 0;
  let unit = 'count';

  const containerPatterns = [
    /([\d,]+)\s*(?:mega|regular|double|triple|big)?\s*(?:flat|cube|pack|boxes?|containers?|rolls?)/i,
  ];
  const unitPatterns = [
    /([\d,]+)\s*(?:tissues|sheets|pieces|units|wipes|napkins)/i,
    /([\d,]+)\s*(?:-ply)?\s*(?:tissues|sheets|pieces|units|wipes|napkins)\s*(?:per|\/)\s*(?:box|cube|pack|container|roll)/i,
  ];
  const totalPatterns = [
    /([\d,]+)\s*(?:total|count)?\s*(?:tissues|sheets|pieces|units|wipes|napkins)/i,
    /([\d,]+)\s*(?:tissues|sheets|pieces|units|wipes|napkins)\s*(?:in\s*total|total)/i,
  ];

  for (const field of fields) {
    if (field) {
      if (totalCount === 0) {
        for (const pattern of totalPatterns) {
          const match = field.match(pattern);
          if (match) {
            totalCount = parseInt(match[1].replace(/,/g, ''), 10);
            break;
          }
        }
      }
      if (containerCount === 0) {
        for (const pattern of containerPatterns) {
          const match = field.match(pattern);
          if (match) {
            containerCount = parseInt(match[1].replace(/,/g, ''), 10);
            break;
          }
        }
      }
      if (unitCount === 0) {
        for (const pattern of unitPatterns) {
          const match = field.match(pattern);
          if (match) {
            unitCount = parseInt(match[1].replace(/,/g, ''), 10);
            break;
          }
        }
      }
    }
    if (containerCount > 0 && unitCount > 0) {
      break;
    }
  }

  if (containerCount > 0 && unitCount > 0) {
    totalCount = containerCount * unitCount;
  } else if (totalCount > 0) {
    if (containerCount === 0 && unitCount > 0) {
      containerCount = Math.round(totalCount / unitCount);
    } else if (unitCount === 0 && containerCount > 0) {
      unitCount = Math.round(totalCount / containerCount);
    }
  }

  if (totalCount === 0) {
    console.error(`No quantity found for item: ${item.name}`);
    return null;
  } else {
    console.log(`Found quantity for item: ${item.name}, Container Count: ${containerCount}, Unit Count: ${unitCount}, Total Count: ${totalCount}, Unit: ${unit}`);
    return { containerCount, unitCount, totalCount, unit };
  }
}

module.exports = extractQuantityInfo;