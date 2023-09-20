function mapToArray(
  map: Map<any, Map<string, number>>
): { id: any; data: { x: string; y: number }[] }[] {
  const output: { id: any; data: { x: string; y: number }[] }[] = [];
  map.forEach((valueMap, key) => {
    const data: { x: string; y: number }[] = [];
    valueMap.forEach((value, innerKey) => {
      data.push({ x: innerKey, y: value });
    });
    output.push({ id: key, data: data });
  });
  return output;
}

function toAccumulative(
  daily: Map<any, Map<string, number>>
): Map<any, Map<string, number>> {
  const out = new Map<any, Map<string, number>>();
  daily.forEach((dailyValueMap, version) => {
    let totalValueMap = out.get(version);
    if (!totalValueMap) {
      totalValueMap = new Map<string, number>();
      out.set(version, totalValueMap);
    }
    let totalValue = 0;
    dailyValueMap.forEach((value, key) => {
      totalValue += value;
      totalValueMap!.set(key, totalValue);
    });
  });
  return out;
}

function convertToTitleCase(str) {
  if (!str) {
    return "";
  }

  // Replace underscores with spaces and then convert to title case
  return str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export { mapToArray, toAccumulative, convertToTitleCase };
