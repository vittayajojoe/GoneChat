const ANIMALS = [
  'จิ้งจอก', 'นกฮูก', 'แมว', 'แพนด้า', 'เสือดาว', 'กระต่าย',
  'หมาป่า', 'นากน้อย', 'หมีขาว', 'โลมา', 'สิงโต', 'เหยี่ยว',
  'เพนกวิน', 'กระรอก', 'ทานุกิ', 'อินทรี', 'กวางป่า', 'ฉลามขาว'
];

const ADJECTIVES = [
  'เงียบสงบ', 'ขี้เซา', 'สีคราม', 'อารมณ์ดี', 'รัตติกาล', 'หิมะ',
  'สายฟ้า', 'สุขุม', 'แสนรู้', 'ใจดี', 'พริ้วไหว', 'นักสำรวจ',
  'ลึกลับ', 'สีทอง', 'ประกายแสง', 'สายลม', 'จอมเวท', 'ขี้อ้อน'
];

export function generateRandomNickname() {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  return `${animal}${adj}`;
}
