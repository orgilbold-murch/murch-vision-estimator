// ═══════════════════════════════════════════════════════════════════════════
// AUXILIARY MATERIAL COMPUTATION ENGINE
// БНбД-д суурилсан норматив тооцоолол
//
// Ported verbatim from the v3 artifact. The coefficients and formula strings
// are frozen; only the function signature changed to use typed inputs. Do
// NOT modify any quantity math without explicit sign-off.
// ═══════════════════════════════════════════════════════════════════════════

import type { BoqLineItem, SectionId } from '@/types';

export interface ComputedAuxItem {
  name: string;
  formula: string;
  qty: number;
  unit: string;
  unitPrice: number;
  group: string;
}

export interface ComputedAuxiliary {
  cctv: ComputedAuxItem[];
  fire: ComputedAuxItem[];
  intercom: ComputedAuxItem[];
  electrical: ComputedAuxItem[];
}

// Input shape accepted by the engine. We intentionally accept only the
// minimum fields needed for the formulas so the engine is stable across
// unrelated BoqLineItem changes.
export interface SectionInput {
  id: SectionId;
  items: Array<
    Pick<BoqLineItem, 'name' | 'qty' | 'unit'> & {
      subsection?: string | undefined;
    }
  >;
}

export function computeAuxiliary(
  sections: readonly SectionInput[],
): ComputedAuxiliary {
  const getSec = (id: SectionId): SectionInput | undefined =>
    sections.find((s) => s.id === id);

  const sumByName = (
    sec: SectionInput | undefined,
    keywords: string[],
  ): number => {
    if (!sec) return 0;
    return sec.items
      .filter((i) =>
        keywords.some((k) => i.name.toLowerCase().includes(k.toLowerCase())),
      )
      .reduce((s, i) => s + i.qty, 0);
  };

  const sumByUnit = (
    sec: SectionInput | undefined,
    unit: string,
  ): number => {
    if (!sec) return 0;
    return sec.items.filter((i) => i.unit === unit).reduce((s, i) => s + i.qty, 0);
  };

  const cctv = getSec('cctv');
  const fire = getSec('fire');
  const intercom = getSec('intercom');
  const elec = getSec('electrical');

  // ─── CCTV ───────────────────────────────────────────────────────────────
  const cctvUtp = sumByName(cctv, ['UTP']);
  const cctvIndoor = sumByName(cctv, ['Дотор камер']);
  const cctvOutdoor = sumByName(cctv, ['Гадна камер']);
  const cctvCams = cctvIndoor + cctvOutdoor;

  const cctvAux: ComputedAuxItem[] = [
    { name: 'RJ45 холбогч Cat.5e', formula: `камер×2 + 10 spare`, qty: Math.ceil(cctvCams * 2 + 10), unit: 'ш', unitPrice: 2500, group: 'Холбогч' },
    { name: 'Кабелийн хавчаар (saddle clip)', formula: `${cctvUtp}м ÷ 0.5м`, qty: Math.ceil(cctvUtp / 0.5), unit: 'ш', unitPrice: 150, group: 'Бэхэлгээ' },
    { name: 'Кабель татах ратан (cable tie)', formula: `${cctvUtp}м ÷ 3м`, qty: Math.ceil(cctvUtp / 3), unit: 'ш', unitPrice: 85, group: 'Бэхэлгээ' },
    { name: 'Хаван цэрц 7см', formula: `камер×4 + 20`, qty: cctvCams * 4 + 20, unit: 'ш', unitPrice: 450, group: 'Бэхэлгээ' },
    { name: 'Өрөмдсөн анкер 6мм', formula: `камер×4 + 20`, qty: cctvCams * 4 + 20, unit: 'ш', unitPrice: 80, group: 'Бэхэлгээ' },
    { name: 'Кабелийн шошго (бичвэртэй)', formula: `камер×4`, qty: cctvCams * 4, unit: 'ш', unitPrice: 280, group: 'Тэмдэглэгээ' },
    { name: 'Дулаан агшаагч хоолой (ассорти 3мм)', formula: `холболт тутамд 0.4м`, qty: cctvCams * 4, unit: 'м', unitPrice: 1200, group: 'Тусгаарлалт' },
    { name: 'Цахилгаан тусгаарлах тууз', formula: `стандарт иж бүрдэл`, qty: 8, unit: 'ш', unitPrice: 3500, group: 'Тусгаарлалт' },
    { name: 'Силикон битүүмжлэл (гадна IP66)', formula: `гадна камер тутамд 1`, qty: cctvOutdoor, unit: 'ш', unitPrice: 8500, group: 'Тусгаарлалт' },
    { name: 'Кабель холбох хайрцаг IP44', formula: `стандарт`, qty: 8, unit: 'ш', unitPrice: 4500, group: 'Хамгаалалт' },
    { name: 'Спираль кабель хамгаалалт', formula: `${cctvUtp}м ÷ 50м`, qty: Math.max(1, Math.ceil(cctvUtp / 50)), unit: 'рулон', unitPrice: 8500, group: 'Хамгаалалт' },
  ];

  // ─── Fire + PA ──────────────────────────────────────────────────────────
  const fireMainCable = sumByName(fire, ['Галд тэсвэртэй кабель']);
  const fireAuxCables = sumByName(fire, ['UTP Cat.5e FACP', '2x1.5мм', 'Экрант']);
  const fireTotalCable = fireMainCable + fireAuxCables;
  const fireSmoke = sumByName(fire, ['Утаа мэдрэгч']);
  const fireHeat = sumByName(fire, ['Дулаан мэдрэгч']);
  const fireHorns = sumByName(fire, ['Дуут дохио']);
  const fireManCalls = sumByName(fire, ['Гар мэдээлэгч']);
  const fireSpeakers = sumByName(fire, ['чанга яригч']);
  const firePoints = fireSmoke + fireHeat + fireHorns + fireManCalls + fireSpeakers;

  const fireAuxData: ComputedAuxItem[] = [
    { name: 'Галд тэсвэртэй холбогч клемм', formula: `цэг×3`, qty: firePoints * 3, unit: 'ш', unitPrice: 350, group: 'Холбогч' },
    { name: 'Дулаан агшаагч хоолой (fire-rated)', formula: `цэг×0.4м`, qty: Math.ceil(firePoints * 0.4), unit: 'м', unitPrice: 1500, group: 'Тусгаарлалт' },
    { name: 'Галд тэсвэртэй кабель хавчаар', formula: `${fireTotalCable}м ÷ 0.4м`, qty: Math.ceil(fireTotalCable / 0.4), unit: 'ш', unitPrice: 380, group: 'Бэхэлгээ' },
    { name: 'Кабелийн ратан (fire-grade)', formula: `${fireTotalCable}м ÷ 3м`, qty: Math.ceil(fireTotalCable / 3), unit: 'ш', unitPrice: 120, group: 'Бэхэлгээ' },
    { name: 'Тусгаарлах резин уут', formula: `цэг тутамд 1`, qty: firePoints, unit: 'ш', unitPrice: 650, group: 'Тусгаарлалт' },
    { name: 'Галын улаан шошго', formula: `цэг + 50 spare`, qty: firePoints + 50, unit: 'ш', unitPrice: 450, group: 'Тэмдэглэгээ' },
    { name: 'Галын анхааруулах хавтан', formula: `анхаарлын хэсэг`, qty: 15, unit: 'ш', unitPrice: 12000, group: 'Тэмдэглэгээ' },
    { name: 'Галд тэсвэртэй битүүмжлэл (fire stop)', formula: `хана нэвтрэх цоолсон`, qty: 40, unit: 'ш', unitPrice: 6500, group: 'Тусгаарлалт' },
    { name: 'Анкер өрөмдлөг 8мм', formula: `цэг×4`, qty: firePoints * 4, unit: 'ш', unitPrice: 120, group: 'Бэхэлгээ' },
    { name: 'Хаван цэрц 10см', formula: `цэг×4`, qty: firePoints * 4, unit: 'ш', unitPrice: 380, group: 'Бэхэлгээ' },
    { name: 'Металл холбох хайрцаг', formula: `нийлүүлэгч цэг`, qty: 25, unit: 'ш', unitPrice: 12000, group: 'Хамгаалалт' },
    { name: 'Станц холбох кабель иж бүрдэл', formula: `FACP + SP×2`, qty: 3, unit: 'иж', unitPrice: 28000, group: 'Холбогч' },
    { name: 'Галын систем тест аккум.', formula: `тест зориулалт`, qty: 2, unit: 'ш', unitPrice: 45000, group: 'Туршилт' },
  ];

  // ─── Intercom + IPTV ────────────────────────────────────────────────────
  const intUtp = sumByName(intercom, ['UTP Cat']);
  const intFiber = sumByName(intercom, ['шилэн', 'Drop cable']);
  const intTotalCable = intUtp + intFiber;
  const intOutlets = sumByName(intercom, ['3-ласан үүр']);
  const intWallPads = sumByName(intercom, ['Wall pad', 'Дүрст харилцуур']);

  const intercomAux: ComputedAuxItem[] = [
    { name: 'RJ45 Cat.6 холбогч', formula: `outlet×3 + pad×2 + 50 spare`, qty: intOutlets * 3 + intWallPads * 2 + 50, unit: 'ш', unitPrice: 3500, group: 'Холбогч' },
    { name: 'Шилэн кабель SC/APC холбогч', formula: `FDB-4 + FDB-8 + FDB-12`, qty: 24, unit: 'ш', unitPrice: 8500, group: 'Холбогч' },
    { name: 'Fusion splice sleeve (шилэн)', formula: `splice цэг`, qty: 30, unit: 'ш', unitPrice: 1500, group: 'Холбогч' },
    { name: 'Патч панел 24-порт Cat.6', formula: `Rack дотор`, qty: 3, unit: 'ш', unitPrice: 180000, group: 'Тоног' },
    { name: 'Патч кабель 1м (Cat.6)', formula: `Rack холболт`, qty: 48, unit: 'ш', unitPrice: 8500, group: 'Холбогч' },
    { name: 'Кабелийн хавчаар', formula: `UTP/${intUtp}м ÷ 0.5м`, qty: Math.ceil(intUtp / 0.5), unit: 'ш', unitPrice: 150, group: 'Бэхэлгээ' },
    { name: 'Кабелийн ратан', formula: `нийт ÷ 3м`, qty: Math.ceil(intTotalCable / 3), unit: 'ш', unitPrice: 85, group: 'Бэхэлгээ' },
    { name: 'Кабелийн шошго', formula: `pad×2 + outlet + 100 spare`, qty: intWallPads * 2 + intOutlets + 100, unit: 'ш', unitPrice: 280, group: 'Тэмдэглэгээ' },
    { name: 'Шилэн кабель цэвэрлэгч иж бүрдэл', formula: `шилэн эвсэх зориулалттай`, qty: 2, unit: 'иж', unitPrice: 45000, group: 'Туршилт' },
    { name: 'Ханын faceplate', formula: `pad + outlet`, qty: intWallPads + intOutlets, unit: 'ш', unitPrice: 3500, group: 'Хавтан' },
    { name: 'Pad ханын бэхэлгээ дэрс', formula: `pad×4`, qty: intWallPads * 4, unit: 'ш', unitPrice: 650, group: 'Бэхэлгээ' },
    { name: 'Тавиурын бэхэлгээ боолт', formula: `13 тавиур × хоорондын`, qty: 20, unit: 'ш', unitPrice: 4500, group: 'Бэхэлгээ' },
    { name: 'Rack-н boolt + тийрэлт иж бүрдэл', formula: `Rack угсралт`, qty: 100, unit: 'ш', unitPrice: 1200, group: 'Бэхэлгээ' },
    { name: 'UPS ба Rack-н кабель багц', formula: `UPS холболт`, qty: 1, unit: 'иж', unitPrice: 85000, group: 'Тоног' },
    { name: 'Дулаан агшаагч хоолой', formula: `холболт тутамд`, qty: 60, unit: 'м', unitPrice: 1200, group: 'Тусгаарлалт' },
  ];

  // ─── Electrical (biggest) ───────────────────────────────────────────────
  const elecTotalPanels = sumByUnit(elec, 'ш') > 0
    ? (elec?.items.filter((i) => i.subsection?.startsWith('4.1')).reduce((s, i) => s + i.qty, 0) ?? 108)
    : 108;
  const elecCablesMeters = elec?.items
    .filter((i) => i.subsection?.startsWith('4.5'))
    .reduce((s, i) => s + i.qty, 0) ?? 0;
  const elecConduitMeters = elec?.items
    .filter((i) => i.subsection?.startsWith('4.6') && i.unit === 'м')
    .reduce((s, i) => s + i.qty, 0) ?? 0;
  const elecSwitches = sumByName(elec, ['унтраалга']);
  const elecSockets = sumByName(elec, ['розетк']);
  const elecSwSo = elecSwitches + elecSockets;
  const elecLights = sumByName(elec, ['ЛЕД', 'Патрон', 'Өдрийн чийдэнт', 'Гарах']);
  const elecElectrodes = sumByName(elec, ['Босоо электрод']);

  const electricalAux: ComputedAuxItem[] = [
    // Panels
    { name: 'DIN зам 35мм', formula: `самбар × 1.5м`, qty: Math.ceil(elecTotalPanels * 1.5), unit: 'м', unitPrice: 4500, group: 'Самбарын туслах' },
    { name: 'Клеммийн блок (ассорти)', formula: `самбар × 20`, qty: elecTotalPanels * 20, unit: 'ш', unitPrice: 850, group: 'Самбарын туслах' },
    { name: 'Шингэн кабелийн залгуур PG-ассорти', formula: `самбар × 8`, qty: elecTotalPanels * 8, unit: 'ш', unitPrice: 2500, group: 'Самбарын туслах' },
    { name: 'Самбарын шошго + дугаарлалт', formula: `самбар × 10`, qty: elecTotalPanels * 10, unit: 'ш', unitPrice: 450, group: 'Тэмдэглэгээ' },
    { name: 'Бухтил (busbar) зэс', formula: `үндсэн самбарт`, qty: 12, unit: 'ш', unitPrice: 18000, group: 'Самбарын туслах' },
    { name: 'Хавтан хоолой (wire duct) шугам 2м', formula: `самбар × 2`, qty: elecTotalPanels * 2, unit: 'ш', unitPrice: 6500, group: 'Самбарын туслах' },
    // Cables
    { name: 'Кабель татах ратан', formula: `${Math.round(elecCablesMeters)}м ÷ 3м`, qty: Math.ceil(elecCablesMeters / 3), unit: 'ш', unitPrice: 85, group: 'Кабелийн туслах' },
    { name: 'Кабелийн хавчаар', formula: `кабель ÷ 0.5м × 0.7`, qty: Math.ceil(elecCablesMeters * 0.7 / 0.5), unit: 'ш', unitPrice: 150, group: 'Кабелийн туслах' },
    { name: 'WAGO/клеммийн холбогч 2.5–6мм²', formula: `холболт цэгүүд`, qty: 2500, unit: 'ш', unitPrice: 680, group: 'Холбогч' },
    { name: 'Цахилгаан тусгаарлах тууз ПВХ', formula: `стандарт норм`, qty: 120, unit: 'ш', unitPrice: 3500, group: 'Тусгаарлалт' },
    { name: 'Дулаан агшаагч хоолой (ассорти)', formula: `эмчлэх зориулалт`, qty: 500, unit: 'м', unitPrice: 1200, group: 'Тусгаарлалт' },
    { name: 'Кабелийн шошго + дугаар', formula: `бүх холболт цэг`, qty: 1500, unit: 'ш', unitPrice: 280, group: 'Тэмдэглэгээ' },
    // Switches/sockets
    { name: 'Боолт (M3.5 өөрөө цахлах)', formula: `цэг × 4`, qty: elecSwSo * 4, unit: 'ш', unitPrice: 85, group: 'Розетк/унтр.' },
    { name: 'Ерөнхий анкер + хаван цэрц', formula: `цэг × 4`, qty: elecSwSo * 4, unit: 'ш', unitPrice: 120, group: 'Розетк/унтр.' },
    { name: 'Утас залгах клемм (PE)', formula: `цэг × 2`, qty: elecSwSo * 2, unit: 'ш', unitPrice: 450, group: 'Розетк/унтр.' },
    // Lights
    { name: 'Гэрэлтүүлэгч бэхэлгээ боолт', formula: `${elecLights} × 4`, qty: elecLights * 4, unit: 'ш', unitPrice: 120, group: 'Гэрэл' },
    { name: 'Таазны дэгээ (pendant-д)', formula: `дүүжин гэрэлд`, qty: 50, unit: 'ш', unitPrice: 850, group: 'Гэрэл' },
    { name: 'Люстрын клемм (WAGO 221)', formula: `${elecLights} × 2`, qty: elecLights * 2, unit: 'ш', unitPrice: 650, group: 'Гэрэл' },
    // Conduit accessories
    { name: 'ПВХ хоолойн булан 90°', formula: `${Math.round(elecConduitMeters)}м ÷ 8м`, qty: Math.ceil(elecConduitMeters / 8), unit: 'ш', unitPrice: 1200, group: 'Хоолойн туслах' },
    { name: 'ПВХ хоолой coupling', formula: `хоолой ÷ 3м`, qty: Math.ceil(elecConduitMeters / 3), unit: 'ш', unitPrice: 350, group: 'Хоолойн туслах' },
    { name: 'Хоолой бэхлэх дэрс (saddle)', formula: `хоолой ÷ 0.8м`, qty: Math.ceil(elecConduitMeters / 0.8), unit: 'ш', unitPrice: 180, group: 'Хоолойн туслах' },
    { name: 'Металл хүчний хайрцаг', formula: `хүчний тал`, qty: 80, unit: 'ш', unitPrice: 8500, group: 'Хоолойн туслах' },
    { name: 'Нахиа stub-out (флюоресценц эсрэг)', formula: `гарц тутамд`, qty: 300, unit: 'ш', unitPrice: 450, group: 'Хоолойн туслах' },
    // Grounding
    { name: 'Газардуулгын хавчаар', formula: `электрод + шинж`, qty: 45, unit: 'ш', unitPrice: 4500, group: 'Газардуулга' },
    { name: 'PE утас (16мм² ногоон-шар)', formula: `тусгай холболт`, qty: 150, unit: 'м', unitPrice: 4500, group: 'Газардуулга' },
    { name: 'Газардуулгын терминал', formula: `самбар + электрод`, qty: 100, unit: 'ш', unitPrice: 2500, group: 'Газардуулга' },
    { name: 'Зэвийн эсрэг будаг (цайр гагнаас)', formula: `хамгаалалт`, qty: 3, unit: 'л', unitPrice: 12000, group: 'Газардуулга' },
    { name: 'Бентонит дэлгэрс 30кг', formula: `електрод × 1`, qty: elecElectrodes, unit: 'шуудай', unitPrice: 8500, group: 'Газардуулга' },
    { name: 'Экзотерм гагнаас CADWELD', formula: `цутгах холболт`, qty: elecElectrodes, unit: 'ш', unitPrice: 25000, group: 'Газардуулга' },
  ];

  return { cctv: cctvAux, fire: fireAuxData, intercom: intercomAux, electrical: electricalAux };
}
