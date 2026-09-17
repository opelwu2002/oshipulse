/**
 * 星座計算工具函式
 * 根據月份與日期精確計算對應星座名稱與符號
 */
export function getZodiacSign(month: number, day: number): { name: string; symbol: string } {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22];
  const signs = [
    { name: '摩羯座', symbol: '♑︎' },
    { name: '水瓶座', symbol: '♒︎' },
    { name: '雙魚座', symbol: '♓︎' },
    { name: '牡羊座', symbol: '♈︎' },
    { name: '金牛座', symbol: '♉︎' },
    { name: '雙子座', symbol: '♊︎' },
    { name: '巨蟹座', symbol: '♋︎' },
    { name: '獅子座', symbol: '♌︎' },
    { name: '處女座', symbol: '♍︎' },
    { name: '天秤座', symbol: '♎︎' },
    { name: '天蠍座', symbol: '♏︎' },
    { name: '射手座', symbol: '♐︎' },
    { name: '摩羯座', symbol: '♑︎' },
  ];
  const index = day < dates[month - 1] ? month - 1 : month;
  return signs[index];
}
