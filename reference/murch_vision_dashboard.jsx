import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Flame, Radio, Zap, LayoutDashboard, Settings2, Settings, Download,
  Printer, RotateCcw, RefreshCw, TrendingDown, Package, Wrench, Cable,
  ChevronDown, ChevronUp, ChevronRight, Info, Percent, Check, Search,
  FileJson, FileSpreadsheet, Sparkles, Target, Activity, Building2,
  Upload, FileText, X, Play, Loader2, Eye, Cpu, Ruler, ScanLine,
  Calculator, CircleDot, ArrowRight, FileCheck, Wifi, HardDrive,
  Boxes, Layers, Binary, Database, AlertCircle, Maximize2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, RadialBarChart, RadialBar
} from 'recharts';

// ============================================================
// LOGO COMPONENT — Murch Vision brand asset
// ============================================================
function Logo({ height = 32, variant = 'full', inverted = false }) {
  const blue = '#0041ff';
  const white = inverted ? '#0041ff' : '#ffffff';

  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 105 130" height={height} xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill={blue} d="M92.5,42.58s-.06-.07-.09-.1c5.53-7.1,8.82-16.02,8.82-25.72,0-5.96-1.24-11.63-3.49-16.76-7.61,14.39-22.68,24.23-40.06,24.35-.11,0-.22,0-.33,0-.55,0-1.09,0-1.64-.03-.49-.02-.98-.04-1.47-.08-.66-.02-1.33-.04-2-.04-7.57,0-14.77,1.6-21.27,4.49-3.35,1.51-6.51,3.36-9.45,5.5C8.48,43.75,0,59.19,0,76.6c0,29,23.51,52.5,52.5,52.5s52.5-23.51,52.5-52.5c0-12.98-4.71-24.85-12.51-34.02ZM80.89,91.57c-5.38,10.17-16.07,17.11-28.38,17.11-.39,0-.77,0-1.15-.02-.35-.01-.69-.03-1.03-.05-10.21-.69-19.11-6.15-24.49-14.17-3.42-5.1-5.41-11.23-5.41-17.83,0-17.72,14.36-32.08,32.08-32.08s32.08,14.36,32.08,32.08c0,5.41-1.34,10.5-3.7,14.97Z"/>
          <path fill={white} d="M71.74,76.56c0,3.24-.8,6.3-2.22,8.98-3.22,6.1-9.63,10.26-17.01,10.26-.23,0-.46,0-.69-.01-.21,0-.41-.02-.62-.03-6.12-.41-11.46-3.69-14.68-8.5-2.05-3.06-3.24-6.73-3.24-10.69,0-10.62,8.61-19.23,19.23-19.23,1.38,0,2.72.14,4.01.42-1.36,1.62-2.18,3.7-2.18,5.98,0,1.91.58,3.69,1.57,5.17,1.56,2.33,4.14,3.91,7.1,4.11.1,0,.2.01.3.02.11,0,.22,0,.33,0,2.75,0,5.23-1.2,6.93-3.1.76,2.07,1.17,4.3,1.17,6.63Z"/>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 683.25 129.1" height={height} xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* MURCH wordmark */}
        <g fill={white}>
          <path d="M183.13,63.41v51.05h-10.26v-26.74l-12.61,15.8h-3.34l-12.61-15.8v26.74h-10.26v-51.05h3.34l21.19,27.12,21.19-27.12h3.34Z"/>
          <path d="M204.52,112.76c-3.22-1.75-5.74-4.25-7.56-7.52-1.82-3.27-2.73-7.1-2.73-11.51v-29.4h10.26v30.16c0,3.65,1.03,6.46,3.08,8.43,2.05,1.97,4.7,2.96,7.94,2.96s5.95-.99,7.98-2.96c2.02-1.98,3.04-4.79,3.04-8.43v-30.16h10.26v29.4c0,4.41-.92,8.24-2.77,11.51-1.85,3.27-4.38,5.77-7.6,7.52-3.22,1.75-6.85,2.62-10.9,2.62s-7.76-.87-10.98-2.62Z"/>
          <path d="M278.62,114.46l-12.99-17.7h-7.52v17.7h-10.26v-50.14h18.84c3.49,0,6.61.67,9.34,2.01,2.73,1.34,4.87,3.24,6.42,5.7,1.54,2.46,2.32,5.28,2.32,8.47s-.79,6.03-2.35,8.51c-1.57,2.48-3.72,4.41-6.46,5.77l14.21,19.68h-11.55ZM258.11,87.72h8.58c2.38,0,4.24-.66,5.58-1.98,1.34-1.32,2.01-3.06,2.01-5.24s-.68-3.85-2.05-5.17c-1.37-1.32-3.22-1.97-5.55-1.97h-8.58v14.36Z"/>
          <path d="M305.63,111.96c-4.08-2.28-7.29-5.41-9.65-9.38-2.35-3.98-3.53-8.37-3.53-13.18s1.19-9.2,3.57-13.18c2.38-3.98,5.61-7.1,9.69-9.38,4.08-2.28,8.57-3.42,13.48-3.42s9.08,1.1,12.95,3.3c3.87,2.2,6.92,5.25,9.15,9.15l-7.75,5.47c-3.55-5.62-8.33-8.43-14.36-8.43-3.09,0-5.86.71-8.32,2.13-2.46,1.42-4.38,3.38-5.77,5.89-1.39,2.51-2.09,5.36-2.09,8.55s.7,6.03,2.09,8.51c1.39,2.48,3.32,4.42,5.77,5.81,2.46,1.39,5.23,2.09,8.32,2.09,6.03,0,10.81-2.81,14.36-8.43l7.75,5.47c-2.18,3.9-5.22,6.95-9.12,9.15-3.9,2.2-8.26,3.3-13.07,3.3s-9.41-1.14-13.48-3.42Z"/>
          <path d="M350.03,64.33h10.26v19.22h22.18v-19.22h10.26v50.14h-10.26v-21.65h-22.18v21.65h-10.26v-50.14Z"/>
        </g>
        {/* Eye icon */}
        <g>
          <path fill={blue} d="M92.5,42.58s-.06-.07-.09-.1c5.53-7.1,8.82-16.02,8.82-25.72,0-5.96-1.24-11.63-3.49-16.76-7.61,14.39-22.68,24.23-40.06,24.35-.11,0-.22,0-.33,0-.55,0-1.09,0-1.64-.03-.49-.02-.98-.04-1.47-.08-.66-.02-1.33-.04-2-.04-7.57,0-14.77,1.6-21.27,4.49-3.35,1.51-6.51,3.36-9.45,5.5C8.48,43.75,0,59.19,0,76.6c0,29,23.51,52.5,52.5,52.5s52.5-23.51,52.5-52.5c0-12.98-4.71-24.85-12.51-34.02ZM80.89,91.57c-5.38,10.17-16.07,17.11-28.38,17.11-.39,0-.77,0-1.15-.02-.35-.01-.69-.03-1.03-.05-10.21-.69-19.11-6.15-24.49-14.17-3.42-5.1-5.41-11.23-5.41-17.83,0-17.72,14.36-32.08,32.08-32.08s32.08,14.36,32.08,32.08c0,5.41-1.34,10.5-3.7,14.97Z"/>
          <path fill={white} d="M71.74,76.56c0,3.24-.8,6.3-2.22,8.98-3.22,6.1-9.63,10.26-17.01,10.26-.23,0-.46,0-.69-.01-.21,0-.41-.02-.62-.03-6.12-.41-11.46-3.69-14.68-8.5-2.05-3.06-3.24-6.73-3.24-10.69,0-10.62,8.61-19.23,19.23-19.23,1.38,0,2.72.14,4.01.42-1.36,1.62-2.18,3.7-2.18,5.98,0,1.91.58,3.69,1.57,5.17,1.56,2.33,4.14,3.91,7.1,4.11.1,0,.2.01.3.02.11,0,.22,0,.33,0,2.75,0,5.23-1.2,6.93-3.1.76,2.07,1.17,4.3,1.17,6.63Z"/>
        </g>
        {/* VISION pill */}
        <rect fill={blue} x="422.74" y="55.21" width="260.5" height="66.72" rx="8.85" ry="8.85"/>
        <g fill={white}>
          <path d="M477.4,63.46l-22.33,51.05h-3.42l-22.41-51.05h11.62l12.53,30.39,12.46-30.39h11.55Z"/>
          <path d="M484.24,63.46h10.26v50.14h-10.26v-50.14Z"/>
          <path d="M510.41,111.51c-3.37-2-6.01-4.7-7.94-8.09l7.06-5.32c1.62,2.23,3.39,4,5.32,5.32,1.92,1.32,4.25,1.98,6.99,1.98,2.23,0,3.98-.49,5.24-1.48,1.27-.99,1.9-2.34,1.9-4.06,0-1.47-.47-2.59-1.41-3.38-.94-.78-2.6-1.73-4.98-2.85l-5.39-2.43c-3.85-1.72-6.84-3.72-8.96-6-2.13-2.28-3.19-5.09-3.19-8.43,0-2.84.72-5.33,2.17-7.48s3.43-3.81,5.96-4.98c2.53-1.16,5.37-1.75,8.51-1.75,3.85,0,7.18.86,9.99,2.58,2.81,1.72,5,4.03,6.57,6.91l-6.99,5.39c-2.58-3.85-5.77-5.77-9.57-5.77-1.77,0-3.25.42-4.44,1.25-1.19.84-1.79,2.04-1.79,3.61,0,1.32.44,2.37,1.33,3.15.89.79,2.39,1.66,4.52,2.62l5.7,2.51c4.2,1.87,7.32,3.94,9.34,6.19,2.02,2.25,3.04,5.08,3.04,8.47,0,3.04-.76,5.7-2.28,7.98s-3.61,4.03-6.27,5.24c-2.66,1.21-5.66,1.82-9,1.82-4.25,0-8.07-1-11.43-3Z"/>
          <path d="M548.43,63.46h10.26v50.14h-10.26v-50.14Z"/>
          <path d="M593.86,114.51c-4.86,0-9.32-1.14-13.37-3.42-4.05-2.28-7.27-5.41-9.65-9.38-2.38-3.98-3.57-8.37-3.57-13.18s1.19-9.2,3.57-13.18c2.38-3.98,5.6-7.1,9.65-9.38,4.05-2.28,8.51-3.42,13.37-3.42s9.33,1.14,13.41,3.42c4.08,2.28,7.32,5.41,9.72,9.38,2.4,3.98,3.61,8.37,3.61,13.18s-1.2,9.21-3.61,13.18c-2.41,3.98-5.65,7.1-9.72,9.38-4.08,2.28-8.55,3.42-13.41,3.42ZM602.18,102.93c2.46-1.39,4.38-3.34,5.77-5.85,1.39-2.51,2.09-5.36,2.09-8.55s-.7-5.96-2.09-8.47c-1.39-2.51-3.32-4.47-5.77-5.89-2.46-1.42-5.2-2.13-8.24-2.13s-5.85.7-8.28,2.09c-2.43,1.39-4.34,3.34-5.74,5.85-1.39,2.51-2.09,5.36-2.09,8.55s.7,6.04,2.09,8.55c1.39,2.51,3.3,4.46,5.74,5.85,2.43,1.39,5.19,2.09,8.28,2.09s5.79-.7,8.24-2.09Z"/>
          <path d="M671.95,63.46v51.05h-3.42l-29.02-30.99v30.08h-10.26v-51.05h3.34l29.1,30.84v-29.93h10.26Z"/>
        </g>
      </g>
    </svg>
  );
}

// ============================================================
// PROJECT METADATA — Бросс-С блок (demo project)
// ============================================================
const PROJECT_META = {
  code: 'ЗП-25-12-229',
  name: 'Бросс-С блок',
  subtitle: '16 давхар, 75 айл',
  clients: '"БРОСС КОНСАЛТИНГ" ХХК · "ХҮННҮЖИН-ЭНХ" ХХК',
  location: 'Улаанбаатар · Хан-Уул дүүрэг · 23 хороо',
  area: '~8,770 м²',
  pageCountHD: 14,
  pageCountHT: 30,
};

// ============================================================
// INITIAL DATA — Extracted from Бросс-С drawings ХД-03, ХТ-4,5,6
// ============================================================
const INITIAL_DATA = [
  {
    id: 'cctv', name: 'Хяналтын камерын систем', shortName: 'CCTV',
    color: '#06b6d4', icon: Camera, source: 'ХД-03',
    items: [
      { name: 'NVR бичлэгийн төхөөрөмж (48 суваг)', spec: 'Hikvision DS-9648NI-I8', qty: 1, unit: 'ш', unitPrice: 3800000, category: 'material' },
      { name: 'Дотор камер 3MP, PoE, TCP/IP', spec: 'Dahua/Hikvision 3MP', qty: 7, unit: 'ш', unitPrice: 320000, category: 'material' },
      { name: 'Гадна камер 4MP, IP66, PoE', spec: '4MP Water-proof', qty: 3, unit: 'ш', unitPrice: 520000, category: 'material' },
      { name: 'Хяналтын монитор 32"', spec: 'LED', qty: 2, unit: 'ш', unitPrice: 850000, category: 'material' },
      { name: 'PoE Switch 4-порт', spec: 'PoSE.w-4', qty: 1, unit: 'ш', unitPrice: 280000, category: 'material' },
      { name: 'PoE Switch 8-порт', spec: 'PoSE.w-8', qty: 1, unit: 'ш', unitPrice: 480000, category: 'material' },
      { name: 'UTP Cat.5e кабель (+15% waste)', spec: '—', qty: 1150, unit: 'м', unitPrice: 2200, category: 'material' },
      { name: 'Суурь иж бүрдэл (анх. хэсгүүд)', spec: '—', qty: 1, unit: 'иж', unitPrice: 420000, category: 'material' },
      { name: 'Камерын цэг угсрах', spec: '10 цэг', qty: 10, unit: 'цэг', unitPrice: 85000, category: 'labor' },
      { name: 'Кабель татах', spec: '—', qty: 1150, unit: 'м', unitPrice: 1200, category: 'labor' },
    ]
  },
  {
    id: 'fire', name: 'Галын дохиолол + Зарлан мэдээлэх', shortName: 'Гал+Зарлан',
    color: '#f97316', icon: Flame, source: 'ХД-03',
    items: [
      { name: 'FACP үндсэн станц 17+ бүс', spec: 'KOM автомат залгууртай', qty: 1, unit: 'ш', unitPrice: 4200000, category: 'material' },
      { name: 'Дэд станц (Sub-panel)', spec: 'System 20П', qty: 2, unit: 'ш', unitPrice: 1100000, category: 'material' },
      { name: 'Утаа мэдрэгч', spec: 'i=100мкА, Rx-1.1кОм', qty: 34, unit: 'ш', unitPrice: 68000, category: 'material' },
      { name: 'Дулаан мэдрэгч', spec: 'i=100мкА, Rx-1.1кОм', qty: 25, unit: 'ш', unitPrice: 55000, category: 'material' },
      { name: 'Дуут дохио 80дБ', spec: '—', qty: 6, unit: 'ш', unitPrice: 125000, category: 'material' },
      { name: 'Гар мэдээлэгч (тел.холбогчтой)', spec: 'F type', qty: 6, unit: 'ш', unitPrice: 95000, category: 'material' },
      { name: 'Галд тэсвэртэй кабель 1x4x0.8мм (+15%)', spec: 'G', qty: 3450, unit: 'м', unitPrice: 4500, category: 'material' },
      { name: 'UTP Cat.5e FACP↔SP (+15%)', spec: 'A', qty: 575, unit: 'м', unitPrice: 2200, category: 'material' },
      { name: 'Тогтмол хүчдэлийн кабель 2x1.5мм (+15%)', spec: 'E', qty: 345, unit: 'м', unitPrice: 1800, category: 'material' },
      { name: 'Батарей блок 12V/220V', spec: '—', qty: 1, unit: 'ш', unitPrice: 380000, category: 'material' },
      { name: 'Удирдлагын пульт + микрофон', spec: '12 суваг', qty: 1, unit: 'ш', unitPrice: 2400000, category: 'material' },
      { name: 'Өсгөгч 600W', spec: 'AMP', qty: 1, unit: 'ш', unitPrice: 1800000, category: 'material' },
      { name: 'Таазны чанга яригч 10W', spec: '—', qty: 5, unit: 'ш', unitPrice: 85000, category: 'material' },
      { name: 'Ханын чанга яригч 10W', spec: '—', qty: 3, unit: 'ш', unitPrice: 95000, category: 'material' },
      { name: 'Гэмтэл хязгаарлагч', spec: '—', qty: 5, unit: 'ш', unitPrice: 65000, category: 'material' },
      { name: 'Экрант 2x1.5мм кабель (+15%)', spec: '—', qty: 1380, unit: 'м', unitPrice: 2400, category: 'material' },
      { name: 'Угсралт: мэдрэгч + чанга яригч', spec: '73 цэг', qty: 73, unit: 'цэг', unitPrice: 45000, category: 'labor' },
      { name: 'Системийн тохиргоо + турших', spec: '—', qty: 1, unit: 'иж', unitPrice: 1500000, category: 'labor' },
    ]
  },
  {
    id: 'intercom', name: 'Домофон + IPTV/Сүлжээ', shortName: 'Домофон+IPTV',
    color: '#a78bfa', icon: Radio, source: 'ХД-03',
    items: [
      { name: 'Дүрст харилцуур (Wall pad)', spec: 'Commax/Fanvil экв', qty: 25, unit: 'ш', unitPrice: 620000, category: 'material' },
      { name: 'Lobby phone орцны самбар', spec: '—', qty: 1, unit: 'ш', unitPrice: 2800000, category: 'material' },
      { name: 'Үндсэн удирдлагын төхөөрөмж', spec: '—', qty: 1, unit: 'ш', unitPrice: 1200000, category: 'material' },
      { name: 'Соронзон түгжээ + механик цоож', spec: '—', qty: 1, unit: 'ш', unitPrice: 420000, category: 'material' },
      { name: 'Гарах товчлуур', spec: '—', qty: 1, unit: 'ш', unitPrice: 35000, category: 'material' },
      { name: 'Нэгтгэх блок Sw-12', spec: '—', qty: 5, unit: 'ш', unitPrice: 380000, category: 'material' },
      { name: 'UTP Cat.5e (+15%)', spec: 'C', qty: 920, unit: 'м', unitPrice: 2200, category: 'material' },
      { name: 'Хананд 3-ласан үүр /тел+инт+ТВ/', spec: '—', qty: 55, unit: 'ш', unitPrice: 28000, category: 'material' },
      { name: 'FDB-4 шилэн салаалагч', spec: '—', qty: 1, unit: 'ш', unitPrice: 180000, category: 'material' },
      { name: 'FDB-8 шилэн салаалагч', spec: '—', qty: 1, unit: 'ш', unitPrice: 240000, category: 'material' },
      { name: 'FDB-12 шилэн салаалагч', spec: '—', qty: 1, unit: 'ш', unitPrice: 320000, category: 'material' },
      { name: 'UTP Cat.6 (+15%)', spec: 'A', qty: 3450, unit: 'м', unitPrice: 3200, category: 'material' },
      { name: 'G617D шилэн кабель (+15%)', spec: 'B', qty: 230, unit: 'м', unitPrice: 2800, category: 'material' },
      { name: 'Drop cable 2-судалт (+15%)', spec: 'b', qty: 345, unit: 'м', unitPrice: 2200, category: 'material' },
      { name: 'Rack 28U 19"', spec: '600x800x1370', qty: 1, unit: 'ш', unitPrice: 1800000, category: 'material' },
      { name: 'UPS 3kW (рак дотор)', spec: 'UPS', qty: 1, unit: 'ш', unitPrice: 2600000, category: 'material' },
      { name: 'Давхар хоорондын хайрцаг', spec: '650x500x150', qty: 5, unit: 'ш', unitPrice: 180000, category: 'material' },
      { name: 'Айлын хайрцаг', spec: '395x310x120', qty: 25, unit: 'ш', unitPrice: 65000, category: 'material' },
      { name: 'Метал тавиур', spec: '200мм L=2м', qty: 13, unit: 'ш', unitPrice: 85000, category: 'material' },
      { name: 'Тавиурын холбогч', spec: '—', qty: 8, unit: 'ш', unitPrice: 18000, category: 'material' },
      { name: 'ПВХ хоолой Ф75мм', spec: '—', qty: 72, unit: 'м', unitPrice: 3500, category: 'material' },
      { name: 'ПВХ хоолой Ф25мм (таамаглал)', spec: '—', qty: 3100, unit: 'м', unitPrice: 900, category: 'material' },
      { name: 'Угсралт: айл + IPTV цэг', spec: '85 цэг', qty: 85, unit: 'цэг', unitPrice: 55000, category: 'labor' },
      { name: 'Кабель татах (нийт)', spec: '—', qty: 4945, unit: 'м', unitPrice: 1200, category: 'labor' },
    ]
  },
  {
    id: 'electrical', name: 'Цахилгаан + Дотор гэрэлтүүлэг', shortName: 'Цахилгаан+ДГ',
    color: '#fbbf24', icon: Zap, source: 'ХТ-4,5,6',
    items: [
      { subsection: '4.1 Самбарууд', name: 'Ерөнхий самбар ЕС-1,2,3', spec: '1320x750x300', qty: 3, unit: 'ш', unitPrice: 3800000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'БТАЗС (бэлтгэл тэжээл)', spec: '1320x750x300', qty: 1, unit: 'ш', unitPrice: 2800000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Гэрлийн самбар ГС-01', spec: '550x320x120', qty: 1, unit: 'ш', unitPrice: 850000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Тоолууртай самбар ТС-А/Б', spec: '395x310x165', qty: 2, unit: 'ш', unitPrice: 620000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Тоолууртай самбар ТС(1-9)', spec: '395x310x165', qty: 9, unit: 'ш', unitPrice: 620000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Тоолууртай самбар ТС-В', spec: '395x310x165', qty: 1, unit: 'ш', unitPrice: 620000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Айлын самбар АС', spec: 'ЩРВ-П-15', qty: 75, unit: 'ш', unitPrice: 280000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Давхрын самбар ТС(2-16)', spec: 'ЩЭ 5', qty: 15, unit: 'ш', unitPrice: 720000, category: 'material' },
      { subsection: '4.1 Самбарууд', name: 'Ослын гэрэл самбар ОГС', spec: '390x310x165', qty: 1, unit: 'ш', unitPrice: 950000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'ВА88-32/33/35 автомат', spec: '3Р, 63-160А', qty: 35, unit: 'ш', unitPrice: 220000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'ВА47-100 автомат', spec: '3Р/4Р, 25-100А', qty: 25, unit: 'ш', unitPrice: 120000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'ВА47-29 автомат', spec: '1Р/2Р, 16А', qty: 180, unit: 'ш', unitPrice: 28000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'АД12 2Р дифференциал', spec: '25A 10/30mA', qty: 35, unit: 'ш', unitPrice: 95000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'АД12 дифференциал', spec: '40A', qty: 8, unit: 'ш', unitPrice: 135000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'ВД1-63 автомат', spec: '2Р-63А', qty: 15, unit: 'ш', unitPrice: 85000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'ТТИ-А гүйдлийн трансформатор', spec: '50/5A, 100/5A, 150/5A', qty: 10, unit: 'ш', unitPrice: 180000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: '3-фазын ухаалаг тоолуур', spec: '—', qty: 8, unit: 'ш', unitPrice: 420000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'РЕ-31120 сэлгэн залгагч', spec: '—', qty: 2, unit: 'ш', unitPrice: 350000, category: 'material' },
      { subsection: '4.2 Автомат + Хамгаалалт', name: 'ОПС1 цэнэг шавхагч', spec: 'B/4, C/4, D/2', qty: 15, unit: 'ш', unitPrice: 85000, category: 'material' },
      { subsection: '4.3 Гэрэлтүүлэг', name: 'Далд батарейтай "Гарах" чийдэн', spec: '230В 20Вт', qty: 3, unit: 'ш', unitPrice: 85000, category: 'material' },
      { subsection: '4.3 Гэрэлтүүлэг', name: 'ЛЕД хөдөлгөөн мэдрэгчтэй 100W', spec: '230В IP20', qty: 75, unit: 'ш', unitPrice: 85000, category: 'material' },
      { subsection: '4.3 Гэрэлтүүлэг', name: 'ЛЕД таазны гэрэлтүүлэгч 100W', spec: '230В IP20', qty: 195, unit: 'ш', unitPrice: 65000, category: 'material' },
      { subsection: '4.3 Гэрэлтүүлэг', name: 'ЛЕД ус-чийг хамгаалалттай 100W', spec: 'IP65', qty: 17, unit: 'ш', unitPrice: 115000, category: 'material' },
      { subsection: '4.3 Гэрэлтүүлэг', name: 'Патрон таазны', spec: '230В IP20', qty: 390, unit: 'ш', unitPrice: 8500, category: 'material' },
      { subsection: '4.3 Гэрэлтүүлэг', name: 'Өдрийн чийдэнт IP65 100W', spec: '—', qty: 50, unit: 'ш', unitPrice: 95000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Далд 1-түлхүүр унтраалга', spec: '230В 16A', qty: 304, unit: 'ш', unitPrice: 18000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Далд 2-түлхүүр унтраалга', spec: '230В 16A', qty: 185, unit: 'ш', unitPrice: 24000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Далд 3-түлхүүр унтраалга', spec: '230В 16A', qty: 15, unit: 'ш', unitPrice: 32000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Хамгаалалттай 1-түлхүүр', spec: 'IP20', qty: 3, unit: 'ш', unitPrice: 28000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Далд хөрст 2-розетк', spec: '230В 25A', qty: 975, unit: 'ш', unitPrice: 22000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Далд паастай хамгаал.розетк', spec: '230В 25A', qty: 75, unit: 'ш', unitPrice: 28000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Ил паастай розетк', spec: '230В 32A IP65', qty: 75, unit: 'ш', unitPrice: 38000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Ил ванны розетк', spec: '230В 25A IP65', qty: 216, unit: 'ш', unitPrice: 32000, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Утас салбарлах хайрцаг', spec: '—', qty: 500, unit: 'ш', unitPrice: 3500, category: 'material' },
      { subsection: '4.4 Унтраалга + Розетк', name: 'Унтраалга/розетк хайрцаг', spec: '—', qty: 1830, unit: 'ш', unitPrice: 1800, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ПВ-660 Ф3(1x2.5)мм² (+15%)', spec: 'ПВ-660', qty: 12075, unit: 'м', unitPrice: 1800, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ПВ-660 Ф3(1x4)мм² (+15%)', spec: 'ПВ-660', qty: 16675, unit: 'м', unitPrice: 2400, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ПВ-660 Ф3(1x6)мм² (+15%)', spec: 'ПВ-660', qty: 1380, unit: 'м', unitPrice: 3600, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ПВ-660 Ф3(1x10)мм² (+15%)', spec: 'ПВ-660', qty: 1380, unit: 'м', unitPrice: 5500, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 5x4мм²', spec: '—', qty: 12, unit: 'м', unitPrice: 7500, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 5x6мм²', spec: '—', qty: 506, unit: 'м', unitPrice: 8500, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 5x10мм²', spec: '—', qty: 12, unit: 'м', unitPrice: 14000, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 5x16мм²', spec: '—', qty: 150, unit: 'м', unitPrice: 22000, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 5x25мм²', spec: '—', qty: 242, unit: 'м', unitPrice: 32000, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 3x50мм²', spec: '—', qty: 12, unit: 'м', unitPrice: 42000, category: 'material' },
      { subsection: '4.5 Кабель + Утас', name: 'ВВГ-660 3x35мм²', spec: '—', qty: 12, unit: 'м', unitPrice: 32000, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'ПВХ хоолой Ф16мм', spec: '—', qty: 8400, unit: 'м', unitPrice: 800, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'ПВХ хоолой Ф25мм', spec: '—', qty: 850, unit: 'м', unitPrice: 1500, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'ПВХ хоолой Ф32мм', spec: '—', qty: 800, unit: 'м', unitPrice: 2400, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Ган хоолой Ф20мм (таамаглал)', spec: '—', qty: 150, unit: 'м', unitPrice: 6500, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Цайрдсан туузан 40x4мм', spec: '—', qty: 135, unit: 'м', unitPrice: 6500, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Цайрдсан туузан 25x4мм', spec: '—', qty: 100, unit: 'м', unitPrice: 4500, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Цайрдсан ган Ф8мм', spec: '—', qty: 320, unit: 'м', unitPrice: 1800, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Босоо электрод Ф30 L=4м', spec: '—', qty: 30, unit: 'ш', unitPrice: 45000, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Тусгаарлагч дэр', spec: '—', qty: 85, unit: 'ш', unitPrice: 12000, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Кабелийн тавиур 50x400', spec: '—', qty: 15, unit: 'ш', unitPrice: 95000, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Тавиурын 90° булан', spec: '50x400', qty: 2, unit: 'ш', unitPrice: 65000, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Тавиурын 3-лагч булан', spec: '50x400', qty: 3, unit: 'ш', unitPrice: 85000, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Тавиурын бэхэлгээ', spec: 'Ф12x60', qty: 90, unit: 'ш', unitPrice: 3500, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Тавиурын баригч', spec: '—', qty: 45, unit: 'ш', unitPrice: 4500, category: 'material' },
      { subsection: '4.6 Хоолой + Газардуулга + Тавиур', name: 'Газардуулгын хайрцаг', spec: '310x580x220', qty: 1, unit: 'ш', unitPrice: 180000, category: 'material' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Гэрэлтүүлэгч цэг угсрах', spec: '730 цэг', qty: 730, unit: 'цэг', unitPrice: 25000, category: 'labor' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Унтраалга/розетк цэг', spec: '1770 цэг', qty: 1770, unit: 'цэг', unitPrice: 18000, category: 'labor' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Самбар угсрах', spec: '108 самбар', qty: 108, unit: 'ш', unitPrice: 180000, category: 'labor' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Кабель татах', spec: '—', qty: 32450, unit: 'м', unitPrice: 1200, category: 'labor' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Хоолой тавих', spec: '—', qty: 10200, unit: 'м', unitPrice: 800, category: 'labor' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Газардуулгын контур угсрах', spec: '—', qty: 1, unit: 'иж', unitPrice: 2500000, category: 'labor' },
      { subsection: '4.7 Угсралтын Ажил', name: 'Турших, тохируулах, актлах', spec: '—', qty: 1, unit: 'иж', unitPrice: 3500000, category: 'labor' },
    ]
  }
];

// ============================================================
// AUXILIARY MATERIAL COMPUTATION ENGINE
// БНбД-д суурилсан норматив тооцоолол
// ============================================================
function computeAuxiliary(sections) {
  const getSec = (id) => sections.find(s => s.id === id);
  const sumByName = (sec, keywords) => {
    if (!sec) return 0;
    return sec.items
      .filter(i => keywords.some(k => i.name.toLowerCase().includes(k.toLowerCase())))
      .reduce((s, i) => s + i.qty, 0);
  };
  const sumByUnit = (sec, unit) => {
    if (!sec) return 0;
    return sec.items.filter(i => i.unit === unit).reduce((s, i) => s + i.qty, 0);
  };

  const cctv = getSec('cctv');
  const fire = getSec('fire');
  const intercom = getSec('intercom');
  const elec = getSec('electrical');

  // ─── CCTV ───
  const cctvUtp = sumByName(cctv, ['UTP']);
  const cctvIndoor = sumByName(cctv, ['Дотор камер']);
  const cctvOutdoor = sumByName(cctv, ['Гадна камер']);
  const cctvCams = cctvIndoor + cctvOutdoor;

  const cctvAux = [
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

  // ─── Fire + PA ───
  const fireMainCable = sumByName(fire, ['Галд тэсвэртэй кабель']);
  const fireAuxCables = sumByName(fire, ['UTP Cat.5e FACP', '2x1.5мм', 'Экрант']);
  const fireTotalCable = fireMainCable + fireAuxCables;
  const fireSmoke = sumByName(fire, ['Утаа мэдрэгч']);
  const fireHeat = sumByName(fire, ['Дулаан мэдрэгч']);
  const fireHorns = sumByName(fire, ['Дуут дохио']);
  const fireManCalls = sumByName(fire, ['Гар мэдээлэгч']);
  const fireSpeakers = sumByName(fire, ['чанга яригч']);
  const firePoints = fireSmoke + fireHeat + fireHorns + fireManCalls + fireSpeakers;

  const fireAuxData = [
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

  // ─── Intercom + IPTV ───
  const intUtp = sumByName(intercom, ['UTP Cat']);
  const intFiber = sumByName(intercom, ['шилэн', 'Drop cable']);
  const intTotalCable = intUtp + intFiber;
  const intOutlets = sumByName(intercom, ['3-ласан үүр']);
  const intWallPads = sumByName(intercom, ['Wall pad', 'Дүрст харилцуур']);

  const intercomAux = [
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

  // ─── Electrical (biggest) ───
  const elecTotalPanels = sumByUnit(elec, 'ш') > 0 ?
    elec.items.filter(i => i.subsection?.startsWith('4.1')).reduce((s, i) => s + i.qty, 0) : 108;
  const elecCablesMeters = elec.items.filter(i => i.subsection?.startsWith('4.5')).reduce((s, i) => s + i.qty, 0);
  const elecConduitMeters = elec.items.filter(i => i.subsection?.startsWith('4.6') && i.unit === 'м').reduce((s, i) => s + i.qty, 0);
  const elecSwitches = sumByName(elec, ['унтраалга']);
  const elecSockets = sumByName(elec, ['розетк']);
  const elecSwSo = elecSwitches + elecSockets;
  const elecLights = sumByName(elec, ['ЛЕД', 'Патрон', 'Өдрийн чийдэнт', 'Гарах']);
  const elecElectrodes = sumByName(elec, ['Босоо электрод']);

  const electricalAux = [
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

// ============================================================
// UTILITIES
// ============================================================
const formatMNT = (n) => new Intl.NumberFormat('mn-MN').format(Math.round(n)) + ' ₮';
const formatShort = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'Б';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'М';
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + 'К';
  return Math.round(n).toString();
};
const formatNum = (n) => new Intl.NumberFormat('mn-MN').format(n);

const TIER_OPTIONS = [
  { id: 'premium', label: 'Premium', desc: 'Европ/Япон брэнд', multiplier: 1.30, accent: '#fbbf24' },
  { id: 'standard', label: 'Standard', desc: 'Hikvision/Schneider/LS', multiplier: 1.00, accent: '#84cc16' },
  { id: 'economy', label: 'Economy', desc: 'Монгол/Хятад хямд', multiplier: 0.78, accent: '#06b6d4' },
];

const AUX_PRICE_PER_SECTION_HINT = {
  cctv: 'CCTV ~ 2-3% материалын дүнгээс',
  fire: 'Гал ~ 3-4% материалын дүнгээс',
  intercom: 'Домофон ~ 2-3% материалын дүнгээс',
  electrical: 'Цахилгаан ~ 5-7% материалын дүнгээс',
};

// ============================================================
// MAIN APP — Screen router
// ============================================================
export default function MurchVisionApp() {
  const [screen, setScreen] = useState('upload'); // 'upload' | 'processing' | 'dashboard'
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Inject fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e){} };
  }, []);

  const startAnalysis = (files) => {
    setUploadedFiles(files);
    setScreen('processing');
  };

  const startDemo = () => {
    setUploadedFiles([
      { name: 'Бросс-С_блок-ХД_2026_04_07.pdf', size: '4.2 MB', pages: 14, type: 'Холбоо-дохиолол' },
      { name: 'Бросс-С_блок-ХТ_ДГ_2026_04_07.pdf', size: '12.8 MB', pages: 30, type: 'Цахилгаан + Дотор гэрэлтүүлэг' },
    ]);
    setScreen('processing');
  };

  const onProcessingComplete = () => setScreen('dashboard');
  const resetApp = () => { setScreen('upload'); setUploadedFiles([]); };

  return (
    <div className="min-h-screen w-full" style={{
      background: 'radial-gradient(ellipse at 20% 0%, #0a1a3e 0%, #050914 60%)',
      fontFamily: 'Manrope, system-ui, sans-serif',
      color: '#e2e8f0'
    }}>
      <GlobalStyles />
      {screen === 'upload' && <UploadScreen onStart={startAnalysis} onDemo={startDemo} />}
      {screen === 'processing' && <ProcessingScreen files={uploadedFiles} onComplete={onProcessingComplete} />}
      {screen === 'dashboard' && <Dashboard onReset={resetApp} files={uploadedFiles} />}
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      .font-display { font-family: 'Unbounded', sans-serif; letter-spacing: -0.01em; }
      .font-mono-tab { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
      .grid-bg {
        background-image: 
          linear-gradient(rgba(0, 65, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 65, 255, 0.05) 1px, transparent 1px);
        background-size: 32px 32px;
      }
      .grid-bg-fine {
        background-image: 
          linear-gradient(rgba(77, 127, 255, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(77, 127, 255, 0.04) 1px, transparent 1px);
        background-size: 16px 16px;
      }
      .blueprint-corner::before, .blueprint-corner::after {
        content: ''; position: absolute; width: 10px; height: 10px;
        border-color: #0041ff; opacity: 0.7;
      }
      .blueprint-corner::before { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
      .blueprint-corner::after { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }
      .ticker { font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
      input[type=number]::-webkit-outer-spin-button,
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }
      .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      .custom-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
      .custom-scroll::-webkit-scrollbar-thumb:hover { background: #334155; }

      @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .fade-in { animation: fadeIn 0.5s ease-out; }
      @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .fade-slide { animation: fadeSlide 0.3s ease-out; }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .slide-up { animation: slideUp 0.5s ease-out both; }
      @keyframes scan {
        0% { transform: translateY(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(100%); opacity: 0; }
      }
      .scanline::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(180deg, transparent 0%, rgba(0, 65, 255, 0.15) 50%, transparent 100%);
        animation: scan 2s linear infinite; pointer-events: none;
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 65, 255, 0.2); }
        50% { box-shadow: 0 0 40px rgba(0, 65, 255, 0.4); }
      }
      .glow { animation: glow 2s ease-in-out infinite; }
      @keyframes ping-ring {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .ping-ring { animation: ping-ring 1.5s ease-out infinite; }
      @keyframes count-up {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .count-up { animation: count-up 0.3s ease-out; }

      @keyframes dash {
        to { stroke-dashoffset: -20; }
      }
      .dash-flow { animation: dash 1s linear infinite; }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .shimmer {
        background: linear-gradient(90deg, transparent, rgba(77, 127, 255, 0.2), transparent);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @media print {
        body { background: white !important; }
        .print\\:hidden { display: none !important; }
        .print\\:shadow-none { box-shadow: none !important; }
        .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
        .print\\:max-w-full { max-width: 100% !important; }
      }
    `}</style>
  );
}

// ============================================================
// UPLOAD SCREEN
// ============================================================
function UploadScreen({ onStart, onDemo }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(f => ({
      name: f.name,
      size: f.size < 1048576 ? (f.size / 1024).toFixed(0) + ' KB' : (f.size / 1048576).toFixed(1) + ' MB',
      pages: Math.max(1, Math.floor(f.size / 300000)),
      type: f.name.toLowerCase().includes('хд') ? 'Холбоо-дохиолол' :
            f.name.toLowerCase().includes('хт') ? 'Цахилгаан' : 'Тодорхойгүй',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const onDrop = (e) => {
    e.preventDefault(); setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-12 md:mb-20">
          <Logo height={28} />
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-500">
            <span className="hidden md:inline">Platform</span>
            <span className="hidden md:inline">Docs</span>
            <div className="px-3 py-1.5 border border-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full pulse-soft"></span>
              Beta · v1.0
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10 md:mb-14 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-block mb-5 px-3 py-1.5 border border-blue-500/30 bg-blue-500/5">
            <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> AI-powered estimation · БНбД нийцэлтэй
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-[1.05] mb-4">
            Ажлын зургаас<br/>
            <span style={{ color: '#4d7fff' }}>BOQ</span> секундын дотор
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            PDF ажлын зургаа оруулахад л AI нь тэмдэглэгээ, зуурмаг, кабелийн урт, туслах материал бүрийг автоматаар таних ба Улаанбаатарын зах зээлийн үнэлгээгээр тооцно.
          </p>
        </div>

        {/* Upload zone */}
        <div className="max-w-3xl mx-auto slide-up" style={{ animationDelay: '0.2s' }}>
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={onDrop}
            className={`relative border-2 border-dashed p-10 md:p-14 text-center transition-all blueprint-corner ${
              dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              ref={inputRef} type="file" multiple accept=".pdf,.dwg,.dxf"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center" style={{
                background: 'rgba(0, 65, 255, 0.1)', border: '1px solid rgba(0, 65, 255, 0.3)'
              }}>
                <Upload className="w-7 h-7 text-blue-400" />
                {dragActive && <div className="absolute inset-0 border-2 border-blue-500 ping-ring"></div>}
              </div>
              <div className="font-display text-xl font-semibold text-white mb-1.5">
                Ажлын зургаа энд чирж оруулах
              </div>
              <div className="text-slate-500 text-sm mb-5">
                эсвэл товчоор сонгон байршуулах · PDF, DWG, DXF · max 50 MB
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-6 py-2.5 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Файл сонгох
              </button>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 border border-slate-800 bg-slate-950/40 fade-in">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Байршуулсан файлууд · {files.length}
                </div>
                <button onClick={() => setFiles([])} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider">
                  Бүгдийг устгах
                </button>
              </div>
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0">
                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{f.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono-tab">
                      {f.size} · ~{f.pages} хуудас · {f.type}
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1 text-slate-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Primary CTA */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {files.length > 0 && (
              <button
                onClick={() => onStart(files)}
                className="group relative px-10 py-4 font-display font-semibold text-base text-white transition-all overflow-hidden"
                style={{ background: '#0041ff' }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  AI-р анализ хийж эхлэх <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 shimmer"></span>
              </button>
            )}
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 slide-up" style={{ animationDelay: '0.3s' }}>
          <FeatureCard
            icon={<ScanLine className="w-5 h-5" />}
            title="Тэмдэглэгээ таних"
            desc="Legend, condlegend, symbol бүгдийг AI visual parser-ээр ялгах"
          />
          <FeatureCard
            icon={<Calculator className="w-5 h-5" />}
            title="Автомат тоолоо"
            desc="Камер, мэдрэгч, унтраалга, розетк бүрийг давхрын план дээр тоолох"
          />
          <FeatureCard
            icon={<Ruler className="w-5 h-5" />}
            title="Кабелийн уртын тооцоо"
            desc="Zuurmag-ийн маршрут хэмжиж scale-тайгаар метр гаргах"
          />
          <FeatureCard
            icon={<Boxes className="w-5 h-5" />}
            title="Туслах материал"
            desc="Клипс, анкер, холбогч, терминал – БНбД-ийн нормоор автомат"
          />
        </div>

        {/* Stats strip */}
        <div className="mt-10 pt-10 border-t border-slate-800/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-center slide-up" style={{ animationDelay: '0.4s' }}>
          <StatCell value="60+" label="сек. доторх боловсруулалт" />
          <StatCell value="15%" label="зах зээлийн үнийн нарийвчлал" />
          <StatCell value="БНбД" label="нормативд нийцсэн" />
          <StatCell value="Монгол" label="хэл, зах зээлд зориулсан" />
        </div>

        <footer className="mt-16 text-center text-[11px] text-slate-600">
          © Murch Vision AI · Ажлын зураг уншигч · Монголын эхний AI Estimator
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-4 border border-slate-800 bg-slate-950/40 hover:border-blue-500/50 transition-colors">
      <div className="w-8 h-8 flex items-center justify-center mb-3" style={{ background: 'rgba(0, 65, 255, 0.1)', color: '#4d7fff' }}>
        {icon}
      </div>
      <div className="font-semibold text-sm text-white mb-1">{title}</div>
      <div className="text-[11px] text-slate-500 leading-relaxed">{desc}</div>
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">{label}</div>
    </div>
  );
}

// ============================================================
// PROCESSING SCREEN — Animated AI pipeline
// ============================================================
const PIPELINE_STAGES = [
  {
    id: 'ocr',
    icon: ScanLine,
    title: 'OCR + Page Extraction',
    subtitle: 'PDF хуудас тус бүрийг visual parser-ээр боловсруулж, техникийн тэмдэглэгээг ялгаж байна',
    duration: 1400,
    stats: [
      { label: 'Боловсруулсан', value: '44/44', unit: 'хуудас' },
      { label: 'DPI', value: '300', unit: 'px/in' },
      { label: 'Тэмдэглэгээ', value: '128', unit: 'OCR-match' },
    ]
  },
  {
    id: 'legend',
    icon: Eye,
    title: 'Legend + Symbol Recognition',
    subtitle: 'Зургийн тэмдэглэгээний жагсаалт, мэдрэгч, камер, гэрэлтүүлгийн симбол бүрийг визуал таньж байна',
    duration: 1200,
    stats: [
      { label: 'CCTV symbols', value: '10', unit: 'таньсан' },
      { label: 'Fire sensors', value: '65', unit: 'таньсан' },
      { label: 'Switches/sockets', value: '1,770+', unit: 'таньсан' },
    ]
  },
  {
    id: 'takeoff',
    icon: Calculator,
    title: 'Material Takeoff',
    subtitle: 'Давхрын план бүрээс материал, тоо ширхэгийг тоолж, спецификацийн хүснэгттэй тулгаж байна',
    duration: 1500,
    stats: [
      { label: 'Материал мөр', value: '120', unit: 'нэр' },
      { label: 'Гэрэлтүүлэгч', value: '730', unit: 'иж бүрдэл' },
      { label: 'Самбар', value: '108', unit: 'иж' },
    ]
  },
  {
    id: 'cable',
    icon: Ruler,
    title: 'Cable Route Measurement',
    subtitle: 'Scale-ийг таньж, кабелийн маршрутын уртыг 2D дээр тооцоолж, +15% waste нэмж байна',
    duration: 1300,
    stats: [
      { label: 'ПВ утас', value: '31.5К', unit: 'м' },
      { label: 'ВВГ кабель', value: '958', unit: 'м' },
      { label: 'Low-voltage', value: '5.9К', unit: 'м' },
    ]
  },
  {
    id: 'aux',
    icon: Boxes,
    title: 'Auxiliary Materials · БНбД',
    subtitle: 'Кабелийн клипс, ратан, WAGO холбогч, хаван цэрц — БНбД 3.02-2016 нормативд тулгуурлан автомат тооцоолж байна',
    duration: 1400,
    stats: [
      { label: 'Кабелийн клипс', value: '~82К', unit: 'ш' },
      { label: 'Холбогч клемм', value: '~3.2К', unit: 'ш' },
      { label: 'Хоолойн fittings', value: '~4.1К', unit: 'ш' },
    ]
  },
  {
    id: 'pricing',
    icon: Database,
    title: 'Market Price Lookup',
    subtitle: 'Улаанбаатарын 2026 Q1 зах зээлийн мэдээлэлд суурилсан нэгж үнээр үнэлгээ хийж дуусгаж байна',
    duration: 1200,
    stats: [
      { label: 'Үнэ шинэчлэгдсэн', value: '2026 Q1', unit: '' },
      { label: 'Брэндийн түвшин', value: 'Standard', unit: '' },
      { label: 'Нийт дүн', value: '~497М', unit: '₮' },
    ]
  },
];

function ProcessingScreen({ files, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);

  useEffect(() => {
    if (currentStage >= PIPELINE_STAGES.length) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const stage = PIPELINE_STAGES[currentStage];
    const step = 50;
    const increment = 100 / (stage.duration / step);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCompletedStages(cs => [...cs, currentStage]);
          setCurrentStage(c => c + 1);
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(interval);
  }, [currentStage, onComplete]);

  const overallProgress = (completedStages.length / PIPELINE_STAGES.length) * 100 + (progress / PIPELINE_STAGES.length);

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Logo height={24} />
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-blue-500/40 bg-blue-500/5">
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              <span className="text-blue-400 uppercase tracking-[0.2em] font-semibold">Analysing</span>
            </div>
            <div className="font-mono-tab text-slate-500">{overallProgress.toFixed(0)}%</div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-2">{files.length} файл · боловсруулж байна</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
            AI Vision parser ажиллаж байна
          </h1>
          <p className="text-slate-400 text-sm">
            {files.map(f => f.name).join(' · ')}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-slate-800 overflow-hidden relative">
            <div
              className="h-full transition-all duration-100"
              style={{ width: overallProgress + '%', background: 'linear-gradient(90deg, #0041ff, #4d7fff)' }}
            />
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mt-2 font-mono-tab">
            <span>0%</span>
            <span>{completedStages.length} / {PIPELINE_STAGES.length} stage дууссан</span>
            <span>100%</span>
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="space-y-2 mb-8">
          {PIPELINE_STAGES.map((stage, i) => (
            <PipelineStage
              key={stage.id}
              stage={stage}
              state={
                completedStages.includes(i) ? 'done' :
                currentStage === i ? 'active' : 'pending'
              }
              progress={currentStage === i ? progress : completedStages.includes(i) ? 100 : 0}
              index={i}
            />
          ))}
        </div>

        {/* Live discovery panel */}
        <div className="border border-slate-800 bg-slate-950/60 p-4 relative overflow-hidden blueprint-corner">
          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-3 flex items-center gap-2">
            <CircleDot className="w-3 h-3 pulse-soft" /> Live discoveries · бодит цагийн таньсан хэсгүүд
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <DiscoveryCell active={currentStage >= 0} label="ХД-03" value="Холбоо-дохиолол" />
            <DiscoveryCell active={currentStage >= 1} label="ХТ-4" value="Зурган тайлбар" />
            <DiscoveryCell active={currentStage >= 1} label="ХТ-5" value="Нэгж шугам" />
            <DiscoveryCell active={currentStage >= 2} label="ХТ-6" value="Материалын жагсаалт" />
            <DiscoveryCell active={currentStage >= 2} label="FACP" value="17+ бүсийн станц" />
            <DiscoveryCell active={currentStage >= 2} label="Wall pads" value="25 айл × 1" />
            <DiscoveryCell active={currentStage >= 3} label="Riser" value="16 давхар босоо" />
            <DiscoveryCell active={currentStage >= 4} label="БНбД" value="3.02-2016 зэрэгтэй" />
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-8 text-center text-xs text-slate-500 font-mono-tab">
          Murch Vision Engine v0.9 · Бодит систем нь DWG/DXF анализ хийх чадвартай бөгөөд одоогоор демо горимд ажиллаж байна
        </div>
      </div>
    </div>
  );
}

function PipelineStage({ stage, state, progress, index }) {
  const Icon = stage.icon;
  const isActive = state === 'active';
  const isDone = state === 'done';
  const isPending = state === 'pending';

  return (
    <div
      className={`relative border transition-all slide-up ${
        isActive ? 'border-blue-500/60 bg-blue-500/5' :
        isDone ? 'border-slate-800 bg-slate-950/40' :
        'border-slate-800/50 bg-slate-950/20'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {isActive && <div className="absolute inset-0 scanline pointer-events-none"></div>}

      <div className="relative p-4 flex items-center gap-4">
        {/* Status icon */}
        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all ${
          isActive ? 'glow' : ''
        }`} style={{
          background: isDone ? 'rgba(132, 204, 22, 0.1)' :
                     isActive ? 'rgba(0, 65, 255, 0.15)' :
                     'rgba(30, 41, 59, 0.4)',
          border: `1px solid ${isDone ? '#84cc16' : isActive ? '#0041ff' : '#1e293b'}`
        }}>
          {isDone ? (
            <Check className="w-5 h-5 text-lime-400" />
          ) : isActive ? (
            <Icon className="w-5 h-5 text-blue-400" />
          ) : (
            <Icon className="w-5 h-5 text-slate-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`font-display font-semibold text-sm ${
              isActive || isDone ? 'text-white' : 'text-slate-600'
            }`}>
              {stage.title}
            </div>
            {isActive && (
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Боловсруулж байна
              </div>
            )}
          </div>
          <div className={`text-[11px] mt-0.5 ${
            isActive ? 'text-slate-300' : isDone ? 'text-slate-500' : 'text-slate-700'
          }`}>
            {stage.subtitle}
          </div>

          {/* Per-stage stats when active or done */}
          {(isActive || isDone) && (
            <div className="mt-2 flex flex-wrap gap-3">
              {stage.stats.map((s, i) => (
                <div key={i} className="flex items-baseline gap-1.5 text-xs count-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-slate-500">{s.label}:</span>
                  <span className={`font-mono-tab font-semibold ${isDone ? 'text-lime-400' : 'text-blue-400'}`}>
                    {s.value}
                  </span>
                  {s.unit && <span className="text-[10px] text-slate-500">{s.unit}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stage index */}
        <div className={`font-mono-tab text-[10px] uppercase tracking-wider ${
          isActive ? 'text-blue-400' : isDone ? 'text-lime-400' : 'text-slate-700'
        }`}>
          {String(index + 1).padStart(2, '0')} / {String(PIPELINE_STAGES.length).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      {(isActive || isDone) && (
        <div className="h-0.5 bg-slate-800/50">
          <div
            className="h-full transition-all"
            style={{
              width: progress + '%',
              background: isDone ? '#84cc16' : 'linear-gradient(90deg, #0041ff, #4d7fff)'
            }}
          />
        </div>
      )}
    </div>
  );
}

function DiscoveryCell({ active, label, value }) {
  return (
    <div className={`p-2 border transition-all ${
      active ? 'border-blue-500/40 bg-blue-500/5' : 'border-slate-800/50 opacity-40'
    }`}>
      <div className={`text-[9px] uppercase tracking-wider font-semibold ${active ? 'text-blue-400' : 'text-slate-600'}`}>
        {label}
      </div>
      <div className={`text-[11px] mt-0.5 ${active ? 'text-white' : 'text-slate-600'}`}>
        {value}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD — Main analytical UI
// ============================================================
function Dashboard({ onReset, files }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('overview');
  const [synergy, setSynergy] = useState(true);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [tier, setTier] = useState('standard');
  const [expandedSub, setExpandedSub] = useState({});
  const [showQuote, setShowQuote] = useState(false);

  const tierMultiplier = TIER_OPTIONS.find(t => t.id === tier).multiplier;

  // Compute main sections
  const sectionTotals = useMemo(() => {
    return data.map(section => {
      const items = section.items.map(it => ({
        ...it, total: it.qty * it.unitPrice * tierMultiplier
      }));
      const materialSum = items.filter(i => i.category === 'material').reduce((s, i) => s + i.total, 0);
      const laborSum = items.filter(i => i.category === 'labor').reduce((s, i) => s + i.total, 0);
      return { ...section, items, material: materialSum, labor: laborSum,
        subtotal: materialSum + laborSum, itemCount: items.length };
    });
  }, [data, tierMultiplier]);

  // Compute auxiliary materials (raw data, not yet priced with tier)
  const auxiliaryData = useMemo(() => {
    const raw = computeAuxiliary(data);
    // Apply tier multiplier to auxiliary prices too
    const priced = {};
    Object.entries(raw).forEach(([key, items]) => {
      priced[key] = items.map(it => ({
        ...it,
        total: it.qty * it.unitPrice * tierMultiplier,
        unitPriceAdjusted: it.unitPrice * tierMultiplier
      }));
    });
    return priced;
  }, [data, tierMultiplier]);

  const auxTotals = useMemo(() => {
    const result = {};
    Object.entries(auxiliaryData).forEach(([key, items]) => {
      result[key] = items.reduce((s, i) => s + i.total, 0);
    });
    result.grand = Object.values(result).reduce((s, v) => s + v, 0);
    return result;
  }, [auxiliaryData]);

  // Grand totals (main + auxiliary)
  const mainSubtotal = sectionTotals.reduce((s, x) => s + x.subtotal, 0);
  const totalLabor = sectionTotals.reduce((s, x) => s + x.labor, 0);
  const totalMaterial = sectionTotals.reduce((s, x) => s + x.material, 0);
  const auxSubtotal = auxTotals.grand;
  const grandSubtotal = mainSubtotal + auxSubtotal;
  const synergyDiscount = synergy ? totalLabor * 0.10 : 0;
  const afterDiscount = grandSubtotal - synergyDiscount;
  const vat = vatEnabled ? afterDiscount * 0.10 : 0;
  const finalTotal = afterDiscount + vat;

  const totalItems = data.reduce((s, x) => s + x.items.length, 0);
  const totalAuxItems = Object.values(auxiliaryData).reduce((s, arr) => s + arr.length, 0);
  const totalCableMeters = data.reduce((s, x) => s + x.items.filter(i => i.unit === 'м').reduce((a, b) => a + b.qty, 0), 0);

  // Handlers
  const updateItem = (sectionId, itemIdx, field, value) => {
    setData(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      const newItems = [...sec.items];
      newItems[itemIdx] = { ...newItems[itemIdx], [field]: Math.max(0, Number(value) || 0) };
      return { ...sec, items: newItems };
    }));
  };

  const toggleSub = (key) => setExpandedSub(prev => {
    const currentlyOpen = prev[key] !== false;
    return { ...prev, [key]: !currentlyOpen };
  });

  const resetData = () => {
    if (window.confirm('Бүх өөрчлөлтийг буцаах уу? Анхны инженерийн тооцоонд шилжинэ.')) {
      setData(INITIAL_DATA); setSynergy(true); setVatEnabled(true); setTier('standard');
    }
  };

  const exportJSON = () => {
    const payload = {
      project: PROJECT_META,
      generated: new Date().toISOString(),
      tier, synergyDiscount: synergy, vatIncluded: vatEnabled,
      sections: sectionTotals, auxiliary: auxiliaryData, auxTotals,
      summary: { mainSubtotal, auxSubtotal, grandSubtotal, synergyDiscount, afterDiscount, vat, finalTotal, totalItems, totalAuxItems, totalCableMeters }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'murch-vision-bross-c-full-estimate.json');
  };

  const exportCSV = () => {
    let csv = 'Хэсэг,Дэд хэсэг,Нэр,Тэмдэглэгээ,Тоо,Нэгж,Нэгж үнэ,Ангилал,Дүн\n';
    sectionTotals.forEach(sec => {
      sec.items.forEach(it => {
        csv += [
          sec.shortName, it.subsection || '—',
          (it.name || '').replace(/,/g, ';'),
          (it.spec || '—').replace(/,/g, ';'),
          it.qty, it.unit, Math.round(it.unitPrice * tierMultiplier),
          it.category === 'labor' ? 'Ажил' : 'Материал',
          Math.round(it.total)
        ].join(',') + '\n';
      });
    });
    Object.entries(auxiliaryData).forEach(([key, items]) => {
      items.forEach(it => {
        csv += [
          'Туслах: ' + key.toUpperCase(), it.group,
          (it.name || '').replace(/,/g, ';'),
          (it.formula || '—').replace(/,/g, ';'),
          it.qty, it.unit, Math.round(it.unitPriceAdjusted),
          'Туслах материал',
          Math.round(it.total)
        ].join(',') + '\n';
      });
    });
    csv += `\n,,,,,,,Үндсэн дэд дүн,${Math.round(mainSubtotal)}\n`;
    csv += `,,,,,,,Туслах дэд дүн,${Math.round(auxSubtotal)}\n`;
    csv += `,,,,,,,SQUAD хөнгөлөлт,${Math.round(-synergyDiscount)}\n`;
    csv += `,,,,,,,НӨАТ,${Math.round(vat)}\n`;
    csv += `,,,,,,,НИЙТ,${Math.round(finalTotal)}\n`;
    downloadBlob(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), 'murch-vision-bross-c-full.csv');
  };

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-5">

        {/* Top nav */}
        <header className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800/60">
            <Logo height={24} />
            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-1.5 border border-slate-700 text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full pulse-soft"></span>
                {PROJECT_META.code}
              </div>
              <button onClick={onReset} className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px]">
                <Upload className="w-3 h-3" /> Шинэ файл
              </button>
              <button
                onClick={() => setShowQuote(true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2 uppercase tracking-wider text-[10px] font-semibold shadow-[0_0_24px_-8px_rgba(59,130,246,0.8)]"
              >
                <Eye className="w-3 h-3" /> Үнийн санал харах
              </button>
            </div>
          </div>

          <div className="mt-5 pb-5 border-b border-slate-800/60 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-semibold flex items-center gap-2">
                  <FileCheck className="w-3 h-3" /> Анализ дууссан · Draft v1.0
                </div>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {PROJECT_META.name} <span className="text-slate-500 font-normal text-2xl">/{PROJECT_META.subtitle}/</span>
              </h1>
              <div className="text-slate-400 text-sm mt-1.5 flex items-center gap-3 flex-wrap">
                <span>{PROJECT_META.clients}</span>
                <span className="text-slate-700">·</span>
                <span>{PROJECT_META.location}</span>
                <span className="text-slate-700">·</span>
                <span className="font-mono-tab">{PROJECT_META.area}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">Эцсийн нийт дүн</div>
              <div className="font-display text-4xl md:text-5xl font-extrabold ticker" style={{ color: '#4d7fff' }}>
                {formatShort(finalTotal)} <span className="text-2xl text-blue-400/60">₮</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono-tab">
                {formatMNT(finalTotal)} {vatEnabled ? '(НӨАТ-тай)' : '(НӨАТ-гүй)'}
              </div>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <MetricCard icon={<Package className="w-4 h-4" />} label="Нэр төрөл" value={totalItems + totalAuxItems} sub={`${totalItems} үндсэн + ${totalAuxItems} туслах`} accent="#4d7fff" />
          <MetricCard icon={<Cable className="w-4 h-4" />} label="Нийт кабель" value={formatShort(totalCableMeters)} sub="метр (+15% waste)" accent="#06b6d4" />
          <MetricCard icon={<Wrench className="w-4 h-4" />} label="Ажлын хөлс" value={formatShort(totalLabor)} sub={`мат: ${formatShort(totalMaterial)}`} accent="#f59e0b" />
          <MetricCard icon={<Boxes className="w-4 h-4" />} label="Туслах материал" value={formatShort(auxSubtotal)} sub={`${totalAuxItems} мөр auto-calc`} accent="#10b981" />
          <MetricCard icon={<TrendingDown className="w-4 h-4" />} label="SQUAD хэмнэлт" value={synergy ? formatShort(synergyDiscount) : '—'} sub={synergy ? '10% ажлын хөлс' : 'унтраалттай'} accent={synergy ? '#84cc16' : '#64748b'} highlight={synergy} />
        </div>

        {/* Tab nav — grouped with clear sections */}
        <div className="mb-5 border border-slate-800 bg-slate-950/60 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Group 1: Overview */}
            <div className="flex-none">
              <div className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">Тойм</div>
              <div className="flex">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard className="w-4 h-4" />} label="Ерөнхий" color="#4d7fff" />
              </div>
            </div>

            {/* Group 2: BOQ sections */}
            <div className="flex-1 min-w-0">
              <div className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold flex items-center justify-between">
                <span>BOQ хэсгүүд</span>
                <span className="font-mono-tab normal-case tracking-normal text-slate-600 text-[10px]">{formatShort(mainSubtotal)}₮</span>
              </div>
              <div className="flex overflow-x-auto custom-scroll">
                {sectionTotals.map(sec => {
                  const Icon = sec.icon;
                  return (
                    <TabButton
                      key={sec.id}
                      active={activeTab === sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      icon={<Icon className="w-4 h-4" />}
                      label={sec.shortName}
                      sublabel={formatShort(sec.subtotal) + '₮'}
                      color={sec.color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Group 3: Extras */}
            <div className="flex-none">
              <div className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">Нэмэлт</div>
              <div className="flex">
                <TabButton active={activeTab === 'auxiliary'} onClick={() => setActiveTab('auxiliary')} icon={<Boxes className="w-4 h-4" />} label="Туслах" sublabel={formatShort(auxSubtotal) + '₮'} color="#10b981" />
                <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 className="w-4 h-4" />} label="Тохиргоо" color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="fade-slide" key={activeTab}>
          {activeTab === 'overview' && <OverviewTab sectionTotals={sectionTotals} mainSubtotal={mainSubtotal} auxSubtotal={auxSubtotal} grandSubtotal={grandSubtotal} synergyDiscount={synergyDiscount} afterDiscount={afterDiscount} vat={vat} finalTotal={finalTotal} synergy={synergy} vatEnabled={vatEnabled} totalLabor={totalLabor} totalMaterial={totalMaterial} auxTotals={auxTotals} />}
          {sectionTotals.map(sec => activeTab === sec.id && (
            <SectionEditor key={sec.id} section={sec} auxItems={auxiliaryData[sec.id] || []} auxTotal={auxTotals[sec.id] || 0} onUpdate={(idx, f, v) => updateItem(sec.id, idx, f, v)} expandedSub={expandedSub} toggleSub={toggleSub} tierMultiplier={tierMultiplier} />
          ))}
          {activeTab === 'auxiliary' && <AuxiliaryTab auxiliaryData={auxiliaryData} auxTotals={auxTotals} sectionTotals={sectionTotals} />}
          {activeTab === 'settings' && <SettingsTab synergy={synergy} setSynergy={setSynergy} vatEnabled={vatEnabled} setVatEnabled={setVatEnabled} tier={tier} setTier={setTier} onReset={resetData} onFullReset={onReset} onExportJSON={exportJSON} onExportCSV={exportCSV} files={files} />}
        </div>

        {/* Bottom summary */}
        <div className="mt-6 border border-slate-800 bg-slate-950/80 backdrop-blur-sm relative">
          <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 divide-slate-800 divide-y md:divide-y-0 md:divide-x">
            <SummaryCell label="Үндсэн материал+ажил" value={formatMNT(mainSubtotal)} sub={`${totalItems} мөр`} />
            <SummaryCell label="Туслах материал" value={formatMNT(auxSubtotal)} sub={`${totalAuxItems} мөр`} />
            <SummaryCell label="Дэд дүн" value={formatMNT(grandSubtotal)} sub="нийт" />
            <SummaryCell label="SQUAD 10%" value={synergy ? '−' + formatMNT(synergyDiscount) : formatMNT(0)} sub={synergy ? 'ажлын хөлснөөс' : 'унтраалттай'} mute={!synergy} negative={synergy} />
            <SummaryCell label={`НӨАТ ${vatEnabled ? '(10%)' : '(0%)'}`} value={vatEnabled ? '+' + formatMNT(vat) : formatMNT(0)} sub={vatEnabled ? '' : ' '} mute={!vatEnabled} />
            <SummaryCell label="НИЙТ" value={formatMNT(finalTotal)} sub={vatEnabled ? 'НӨАТ-тай' : 'НӨАТ-гүй'} highlight />
          </div>
        </div>

        <footer className="mt-5 pt-3 border-t border-slate-800/50 flex items-center justify-between flex-wrap gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono-tab">Engine v0.9</span>
            <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> ХД-03 · ХТ-4,5,6</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-blue-400" /> Vision-parsed</span>
            <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-emerald-400" /> БНбД 3.02-2016</span>
          </div>
          <div>© Murch Vision AI · {new Date().getFullYear()}</div>
        </footer>
      </div>

      {/* Floating "Preview Quote" CTA — always visible at bottom-right */}
      <button
        onClick={() => setShowQuote(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2.5 shadow-[0_12px_36px_-8px_rgba(77,127,255,0.6)] transition-all hover:scale-105 group"
        style={{ boxShadow: '0 0 0 1px rgba(77,127,255,0.4), 0 20px 48px -12px rgba(0,65,255,0.5)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Eye className="w-5 h-5 relative z-10" />
        <div className="relative z-10 text-left leading-tight">
          <div className="text-[10px] uppercase tracking-wider opacity-80">Үнийн санал</div>
          <div className="font-display font-bold text-sm">{formatShort(finalTotal)}₮ үзэх</div>
        </div>
      </button>

      {/* Quote Preview Modal */}
      {showQuote && (
        <QuotePreview
          onClose={() => setShowQuote(false)}
          sectionTotals={sectionTotals}
          auxiliaryData={auxiliaryData}
          auxTotals={auxTotals}
          mainSubtotal={mainSubtotal}
          auxSubtotal={auxSubtotal}
          grandSubtotal={grandSubtotal}
          totalLabor={totalLabor}
          totalMaterial={totalMaterial}
          synergy={synergy}
          synergyDiscount={synergyDiscount}
          afterDiscount={afterDiscount}
          vatEnabled={vatEnabled}
          vat={vat}
          finalTotal={finalTotal}
          tier={tier}
          tierMultiplier={tierMultiplier}
          files={files}
          onExportJSON={exportJSON}
          onExportCSV={exportCSV}
        />
      )}
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================================
// SHARED SMALL COMPONENTS
// ============================================================
function MetricCard({ icon, label, value, sub, accent, highlight }) {
  return (
    <div className={`relative p-3 border bg-slate-950/40 blueprint-corner transition-all ${highlight ? 'border-lime-500/40' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div className="font-display text-xl md:text-2xl font-bold text-white ticker leading-none">{value}</div>
      <div className="text-[10px] text-slate-500 mt-1">{sub}</div>
      <div className="absolute top-0 left-0 h-[2px] transition-all" style={{ width: highlight ? '100%' : '30%', background: accent, opacity: 0.8 }}></div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, sublabel, color }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-w-[110px] px-3 md:px-4 py-2.5 flex items-center gap-2.5 text-sm transition-all whitespace-nowrap group ${
        active
          ? 'bg-slate-900/80'
          : 'hover:bg-slate-900/40'
      }`}
    >
      {active && (
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }}></div>
      )}
      <div
        className={`w-7 h-7 flex items-center justify-center flex-shrink-0 transition-all ${
          active ? '' : 'bg-slate-900/60 group-hover:bg-slate-800/60'
        }`}
        style={active ? { background: color + '25', color: color } : {}}
      >
        <span className={active ? '' : 'text-slate-500 group-hover:text-slate-300'}>{icon}</span>
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className={`text-xs ${active ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
        {sublabel && (
          <span className={`font-mono-tab text-[10px] tracking-tight ${active ? 'text-slate-300' : 'text-slate-600'}`}>{sublabel}</span>
        )}
      </div>
    </button>
  );
}

function SummaryCell({ label, value, sub, highlight, mute, negative }) {
  return (
    <div className="p-3 relative">
      <div className={`text-[10px] uppercase tracking-[0.2em] mb-1 ${highlight ? 'text-blue-400' : 'text-slate-500'}`}>{label}</div>
      <div className={`font-display ${highlight ? 'text-xl md:text-2xl' : 'text-base md:text-lg'} font-bold ticker ${
        highlight ? 'text-blue-400' : negative ? 'text-amber-400' : mute ? 'text-slate-600' : 'text-white'
      }`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ============================================================
// OVERVIEW TAB
// ============================================================
function OverviewTab({ sectionTotals, mainSubtotal, auxSubtotal, grandSubtotal, synergyDiscount, afterDiscount, vat, finalTotal, synergy, vatEnabled, totalLabor, totalMaterial, auxTotals }) {
  const pieData = [
    ...sectionTotals.map(s => ({ name: s.shortName, value: s.subtotal, color: s.color })),
    { name: 'Туслах', value: auxSubtotal, color: '#10b981' }
  ];

  const topItems = useMemo(() => {
    const all = [];
    sectionTotals.forEach(sec => {
      sec.items.forEach(it => all.push({
        name: it.name.length > 30 ? it.name.slice(0, 28) + '…' : it.name,
        fullName: it.name, value: it.total, color: sec.color, section: sec.shortName
      }));
    });
    return all.sort((a, b) => b.value - a.value).slice(0, 12);
  }, [sectionTotals]);

  const laborMaterialData = [
    { name: 'Материал', value: totalMaterial, color: '#4d7fff' },
    { name: 'Ажил', value: totalLabor, color: '#f59e0b' },
    { name: 'Туслах', value: auxSubtotal, color: '#10b981' }
  ];

  return (
    <div className="space-y-4">
      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {sectionTotals.map(sec => {
          const Icon = sec.icon;
          const pct = (sec.subtotal / grandSubtotal) * 100;
          return (
            <div key={sec.id} className="border border-slate-800 p-4 bg-slate-950/40 relative blueprint-corner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center" style={{ background: sec.color + '20', color: sec.color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{sec.source}</div>
                    <div className="font-semibold text-sm text-white">{sec.shortName}</div>
                  </div>
                </div>
                <div className="font-mono-tab text-xs text-slate-400">{pct.toFixed(1)}%</div>
              </div>
              <div className="font-display text-xl font-bold text-white ticker">
                {formatShort(sec.subtotal)} <span className="text-sm text-slate-500">₮</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 mb-2">
                {sec.itemCount} мөр · {formatShort(sec.material)}₮ мат + {formatShort(sec.labor)}₮ ажил
              </div>
              <div className="h-1 bg-slate-800 overflow-hidden">
                <div className="h-full transition-all" style={{ width: pct + '%', background: sec.color }}></div>
              </div>
            </div>
          );
        })}

        {/* Auxiliary summary card */}
        <div className="border border-emerald-500/30 p-4 bg-emerald-500/5 relative blueprint-corner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-400">АВТО</div>
                <div className="font-semibold text-sm text-white">Туслах</div>
              </div>
            </div>
            <div className="font-mono-tab text-xs text-emerald-400">
              {((auxSubtotal / grandSubtotal) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="font-display text-xl font-bold text-white ticker">
            {formatShort(auxSubtotal)} <span className="text-sm text-slate-500">₮</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 mb-2">БНбД-ийн нормоор автомат тооцсон</div>
          <div className="h-1 bg-slate-800 overflow-hidden">
            <div className="h-full transition-all bg-emerald-500" style={{ width: ((auxSubtotal / grandSubtotal) * 100) + '%' }}></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="border border-slate-800 p-5 bg-slate-950/40 lg:col-span-2 blueprint-corner relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Зардлын задаргаа</div>
              <div className="font-display text-lg font-semibold text-white mt-0.5">Хэсгүүдийн хувь</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2} dataKey="value" stroke="#0f1829" strokeWidth={2}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a1020', border: '1px solid #1e293b', borderRadius: 0, fontSize: '12px' }} formatter={(v) => formatMNT(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ background: p.color }}></div>
                  <span className="text-slate-300">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono-tab">
                  <span className="text-slate-500 text-[10px]">{((p.value / grandSubtotal) * 100).toFixed(1)}%</span>
                  <span className="text-white">{formatShort(p.value)}₮</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-800 p-5 bg-slate-950/40 lg:col-span-3 blueprint-corner relative">
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Top-12 Cost Drivers</div>
            <div className="font-display text-lg font-semibold text-white mt-0.5">Хамгийн үнэтэй мөрүүд</div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 0, right: 40 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={formatShort} />
              <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0a1020', border: '1px solid #1e293b', borderRadius: 0, fontSize: '12px' }} formatter={(v) => formatMNT(v)} labelFormatter={(l, p) => p[0]?.payload?.fullName || l} />
              <Bar dataKey="value" radius={0}>
                {topItems.map((it, i) => <Cell key={i} fill={it.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Material vs Labor + Computation Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="border border-slate-800 p-5 bg-slate-950/40 blueprint-corner relative">
          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">Бүтэц</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={laborMaterialData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value" stroke="#0f1829" strokeWidth={2}>
                {laborMaterialData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a1020', border: '1px solid #1e293b', borderRadius: 0, fontSize: '12px' }} formatter={(v) => formatMNT(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {laborMaterialData.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" style={{ background: d.color }}></div>
                  <span className="text-slate-300">{d.name}</span>
                </span>
                <span className="font-mono-tab text-white">{formatShort(d.value)}₮</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-800 p-5 bg-slate-950/40 blueprint-corner relative">
          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">Тооцооллын гинж</div>
          <div className="space-y-2.5">
            <CalcRow label="1 · Үндсэн материал" value={formatMNT(totalMaterial)} />
            <CalcRow label="2 · Ажлын хөлс" value={formatMNT(totalLabor)} />
            <CalcRow label="3 · Туслах материал (БНбД auto)" value={formatMNT(auxSubtotal)} emerald />
            <CalcRow label="4 · Дэд дүн (нийт)" value={formatMNT(grandSubtotal)} bold />
            {synergy && <CalcRow label="5 · SQUAD Synergy −10%" value={'− ' + formatMNT(synergyDiscount)} amber note="ажлын хөлснөөс хасна" />}
            <CalcRow label={synergy ? '6 · Хөнгөлөлтийн дараа' : '5 · НӨАТ-гүй дүн'} value={formatMNT(afterDiscount)} bold />
            {vatEnabled && <CalcRow label={`${synergy ? '7' : '6'} · НӨАТ +10%`} value={'+ ' + formatMNT(vat)} amber />}
            <div className="pt-3 border-t border-slate-800">
              <CalcRow label="ЭЦСИЙН НИЙТ ДҮН" value={formatMNT(finalTotal)} final />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalcRow({ label, value, bold, amber, final, emerald, note }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${final ? 'py-1' : ''}`}>
      <div>
        <div className={`text-sm ${
          final ? 'font-display font-bold text-blue-400 uppercase tracking-wider' :
          bold ? 'text-white font-semibold' : 'text-slate-300'
        }`}>{label}</div>
        {note && <div className="text-[10px] text-slate-500 mt-0.5">{note}</div>}
      </div>
      <div className={`font-mono-tab ${
        final ? 'text-2xl font-bold text-blue-400' :
        bold ? 'text-base font-bold text-white' :
        emerald ? 'text-emerald-400' :
        amber ? 'text-amber-400' : 'text-slate-200'
      }`}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION EDITOR — per-section editable items + auxiliary preview
// ═══════════════════════════════════════════════════════════════════════════
function SectionEditor({ section, auxItems, auxTotal, onUpdate, expandedSub, toggleSub, tierMultiplier }) {
  const [search, setSearch] = useState('');

  const items = section.items;
  const filtered = items
    .map((it, origIdx) => ({ ...it, _idx: origIdx }))
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.spec && item.spec.toLowerCase().includes(search.toLowerCase()))
    );

  // Group electrical items by subsection
  const hasSubsections = items.some(it => it.subsection);
  const grouped = hasSubsections
    ? filtered.reduce((acc, item) => {
        const key = item.subsection || 'Бусад';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    : null;

  const totalMaterial = section.material;
  const totalLabor = section.labor;

  return (
    <div className="fade-in">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8" style={{ background: section.color }}></div>
            <h2 className="font-display text-2xl font-bold text-white">{section.name}</h2>
          </div>
          <div className="text-xs text-slate-500">
            {items.length} нэр төрөл · {auxItems.length} туслах материал · Нийт {items.reduce((s, i) => s + i.qty, 0).toLocaleString('en-US')} ш/м
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Материал</div>
            <div className="font-mono-tab text-lg text-white">{formatShort(totalMaterial)}₮</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Ажил</div>
            <div className="font-mono-tab text-lg text-white">{formatShort(totalLabor)}₮</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-emerald-500">Туслах</div>
            <div className="font-mono-tab text-lg text-emerald-400">{formatShort(auxTotal)}₮</div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Материал хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono-tab">
          {filtered.length} / {items.length}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main items list */}
        <div className="xl:col-span-2">
          {hasSubsections ? (
            <div className="space-y-3">
              {Object.entries(grouped).map(([group, groupItems]) => {
                const isExpanded = expandedSub[group] !== false;
                const groupTotal = groupItems.reduce((s, i) => s + i.qty * i.unitPrice * (i.category === 'material' ? tierMultiplier : 1), 0);
                return (
                  <div key={group} className="border border-slate-800 bg-slate-950/40">
                    <button
                      onClick={() => toggleSub(group)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="font-display text-sm font-semibold text-white">{group}</span>
                        <span className="text-xs text-slate-500">({groupItems.length})</span>
                      </div>
                      <span className="font-mono-tab text-sm text-slate-300">{formatShort(groupTotal)}₮</span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-800 divide-y divide-slate-900">
                        {groupItems.map((item) => (
                          <ItemRow
                            key={item._idx}
                            item={item}
                            idx={item._idx}
                            update={onUpdate}
                            tierMultiplier={tierMultiplier}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-950/40 divide-y divide-slate-900">
              {filtered.map((item) => (
                <ItemRow
                  key={item._idx}
                  item={item}
                  idx={item._idx}
                  update={onUpdate}
                  tierMultiplier={tierMultiplier}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auxiliary preview sidebar */}
        <div className="xl:col-span-1">
          <div className="border border-emerald-900/50 bg-gradient-to-br from-emerald-950/30 to-slate-950/60 p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <div className="font-display text-sm font-bold text-emerald-300 uppercase tracking-wider">Туслах материал</div>
            </div>
            <div className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              БНбД нормчлолоор автоматаар тооцоолсон. {AUX_PRICE_PER_SECTION_HINT[section.id] || ''}
            </div>
            <div className="max-h-[520px] overflow-y-auto custom-scroll -mr-2 pr-2">
              <div className="space-y-1.5">
                {auxItems.map((a, i) => (
                  <div key={i} className="flex justify-between gap-2 py-1.5 border-b border-slate-800/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate">{a.name}</div>
                      <div className="text-[10px] text-slate-500">{a.group} · {a.qty.toLocaleString('en-US')} {a.unit}</div>
                    </div>
                    <div className="font-mono-tab text-xs text-emerald-400 whitespace-nowrap">{formatShort(a.total || a.qty * a.unitPrice)}₮</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-emerald-900/50 flex justify-between items-center">
              <span className="text-xs text-slate-400">Нийт</span>
              <span className="font-mono-tab text-lg font-bold text-emerald-400">{formatMNT(auxTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, idx, update, tierMultiplier }) {
  const effectiveMultiplier = item.category === 'material' ? tierMultiplier : 1;
  const total = item.qty * item.unitPrice * effectiveMultiplier;
  return (
    <div className="px-4 py-3 hover:bg-slate-900/30 transition group">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {item.category === 'labor' && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-amber-950/60 border border-amber-900/50 text-amber-400 uppercase tracking-wider">Ажил</span>
            )}
            <span className="text-sm text-white leading-tight">{item.name}</span>
          </div>
          {item.spec && <div className="text-[10px] text-slate-500 mt-0.5">{item.spec}</div>}
        </div>
        <div className="font-mono-tab text-sm font-bold text-white whitespace-nowrap">{formatShort(total)}₮</div>
      </div>
      <div className="flex items-center gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">Тоо:</span>
          <input
            type="number"
            value={item.qty}
            onChange={(e) => update(idx, 'qty', parseFloat(e.target.value) || 0)}
            className="w-20 bg-slate-950 border border-slate-800 px-2 py-1 text-xs font-mono-tab text-white focus:border-blue-500 focus:outline-none"
          />
          <span className="text-slate-600 text-[10px]">{item.unit}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">Үнэ:</span>
          <input
            type="number"
            value={item.unitPrice}
            onChange={(e) => update(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
            className="w-28 bg-slate-950 border border-slate-800 px-2 py-1 text-xs font-mono-tab text-white focus:border-blue-500 focus:outline-none"
          />
          <span className="text-slate-600 text-[10px]">₮</span>
        </div>
        {tierMultiplier !== 1 && item.category === 'material' && (
          <span className="text-[10px] text-slate-500">×{tierMultiplier.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUXILIARY TAB — all aux materials across all 4 sections
// ═══════════════════════════════════════════════════════════════════════════
function AuxiliaryTab({ auxiliaryData, auxTotals, sectionTotals }) {
  const grandTotal = auxTotals.grand;

  // Build a section-id → meta map
  const sectionMeta = {};
  sectionTotals.forEach(sec => {
    sectionMeta[sec.id] = { name: sec.name, color: sec.color, shortName: sec.shortName || sec.name };
  });

  const sectionIds = ['cctv', 'fire', 'intercom', 'electrical'].filter(id => auxiliaryData[id]);

  // Group by group name across all sections for summary
  const groupSummary = {};
  sectionIds.forEach(sk => {
    (auxiliaryData[sk] || []).forEach(a => {
      if (!groupSummary[a.group]) groupSummary[a.group] = { count: 0, total: 0 };
      groupSummary[a.group].count += 1;
      groupSummary[a.group].total += (a.total || a.qty * a.unitPrice);
    });
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-slate-800">
        <div className="flex items-start justify-between gap-6 mb-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-6 h-6 text-emerald-400" />
              <h2 className="font-display text-2xl font-bold text-white">Туслах материалын тооцоо</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              БНбД 43-101-18, БНбД 43-103-18 болон кабелийн үйлдвэрлэгчийн нормд
              тулгуурлан, үндсэн материалын тоо ширхэг болон кабелийн уртаас автоматаар тооцсон.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-emerald-500 mb-1">Нийт туслах материал</div>
            <div className="font-mono-tab text-3xl font-bold text-emerald-400">{formatMNT(grandTotal)}</div>
          </div>
        </div>

        {/* Calculation reference card */}
        <div className="mt-4 p-4 bg-emerald-950/20 border border-emerald-900/40">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2 font-semibold flex items-center gap-2">
            <Info className="w-3 h-3" />
            Тооцооллын коэффициентүүд (БНбД)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-[11px]">
            <RefItem label="Кабель бэхэлгээ" value="0.5 м тутамд 1" />
            <RefItem label="Галын кабель бэхэлгээ" value="0.4 м тутамд 1" />
            <RefItem label="Кабель боолт" value="3 м тутамд 1" />
            <RefItem label="Кабелийн нөөц" value="+15%" />
            <RefItem label="RJ45 холбогч" value="төгсгөл×2 + 10%" />
            <RefItem label="Халуун агшилт" value="0.4 м / холболт" />
            <RefItem label="Дюбель/анкер" value="цэг × 4 ш" />
            <RefItem label="DIN рейк" value="самбар × 1.5 м" />
            <RefItem label="Хоолойн булан" value="8 м тутамд 1" />
            <RefItem label="Хоолойн холбогч" value="3 м тутамд 1" />
            <RefItem label="Сэдэл бэхэлгээ" value="0.8 м тутамд 1" />
            <RefItem label="Бентонит" value="1 шуудай / электрод" />
          </div>
        </div>
      </div>

      {/* Group summary strip */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2.5">Бүлгээр задаргаа (топ 6)</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(groupSummary)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 6)
            .map(([group, data]) => (
              <div key={group} className="border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-500 mb-1 truncate">{group}</div>
                <div className="font-mono-tab text-base font-bold text-white">{formatShort(data.total)}₮</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{data.count} зүйл</div>
              </div>
            ))}
        </div>
      </div>

      {/* Per-section blocks */}
      <div className="space-y-5">
        {sectionIds.map((sk) => {
          const items = auxiliaryData[sk] || [];
          const sectionTotal = auxTotals[sk] || 0;
          const meta = sectionMeta[sk] || { name: sk, color: '#10b981' };
          const sectionGrouped = items.reduce((acc, item) => {
            if (!acc[item.group]) acc[item.group] = [];
            acc[item.group].push(item);
            return acc;
          }, {});
          return (
            <div key={sk} className="border border-slate-800 bg-slate-950/40 blueprint-corner">
              <div
                className="px-5 py-4 border-b border-slate-800 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${meta.color}18, transparent)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10" style={{ background: meta.color }}></div>
                  <div>
                    <div className="font-display text-base font-bold text-white">{meta.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{items.length} нэр төрөл · {Object.keys(sectionGrouped).length} бүлэг</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-500">Дэд дүн</div>
                  <div className="font-mono-tab text-xl font-bold text-emerald-400">{formatMNT(sectionTotal)}</div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(sectionGrouped).map(([groupName, groupItems]) => {
                  const groupTotal = groupItems.reduce((s, a) => s + (a.total || a.qty * a.unitPrice), 0);
                  return (
                    <div key={groupName} className="border border-slate-800/60 bg-slate-950/40 p-3">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60">
                        <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">{groupName}</div>
                        <div className="font-mono-tab text-xs text-emerald-400">{formatShort(groupTotal)}₮</div>
                      </div>
                      <div className="space-y-1">
                        {groupItems.map((a, i) => (
                          <div key={i} className="flex justify-between items-baseline text-xs gap-2">
                            <span className="text-slate-300 flex-1 truncate">{a.name}</span>
                            <span className="font-mono-tab text-slate-500 text-[10px] whitespace-nowrap">{a.qty.toLocaleString('en-US')} {a.unit}</span>
                            <span className="font-mono-tab text-white w-20 text-right">{formatShort(a.total || a.qty * a.unitPrice)}₮</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RefItem({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-slate-400">{label}:</span>
      <span className="font-mono-tab text-emerald-300 text-[10px]">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS TAB — tier, synergy, VAT, export, reset
// ═══════════════════════════════════════════════════════════════════════════
function SettingsTab({
  synergy, setSynergy,
  vatEnabled, setVatEnabled,
  tier, setTier,
  onReset, onFullReset,
  onExportJSON, onExportCSV,
  files
}) {
  const tierExamples = {
    premium: 'Bosch, Siemens, ABB, Panasonic, Hager',
    standard: 'Hikvision, Schneider, LS, CommScope, Nexans',
    economy: 'Монгол угсрах, Hytera, CHINT, Baokuan'
  };

  return (
    <div className="fade-in max-w-5xl">
      <div className="mb-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-blue-400" />
          <h2 className="font-display text-2xl font-bold text-white">Тооцооллын тохиргоо</h2>
        </div>
        <p className="text-sm text-slate-400">
          Материалын ангилал, SQUAD синерги, татвар болон экспортын тохиргоог энд удирдана.
        </p>
      </div>

      {/* Tier selector */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Материалын чанарын түвшин</h3>
        </div>
        <div className="text-xs text-slate-500 mb-4">
          Сонгосон түвшин нь зөвхөн үндсэн материалын үнэд үржигч болж, ажлын хөлсөнд нөлөөлөхгүй
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIER_OPTIONS.map((opt) => {
            const isActive = tier === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTier(opt.id)}
                className={`relative p-5 text-left border-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="font-display text-base font-bold text-white mb-1">{opt.label}</div>
                <div className="text-xs text-slate-400 mb-3 leading-relaxed">{opt.desc}</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-tab text-2xl font-bold" style={{ color: isActive ? '#4d7fff' : opt.accent }}>
                    ×{opt.multiplier.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500">үржигч</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 leading-relaxed">
                  <span className="text-slate-400">Жишээ брэнд: </span>
                  <span className="text-slate-300">{tierExamples[opt.id]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synergy + VAT toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ToggleCard
          icon={<Zap className="w-5 h-5" />}
          title="SQUAD Synergy хөнгөлөлт"
          desc="SQUAD нэгдлийн гишүүн ажил гүйцэтгэгч сонгосон тохиолдолд ажлын хөлснөөс 10% хасагдана"
          checked={synergy}
          onChange={setSynergy}
          savingsNote={synergy ? 'Хөнгөлөлт идэвхитэй' : 'Унтраалгатай'}
        />
        <ToggleCard
          icon={<Percent className="w-5 h-5" />}
          title="НӨАТ тооцох"
          desc="Нэмэгдсэн өртгийн албан татвар 10% эцсийн дэд дүн дээр нэмэгдэнэ"
          checked={vatEnabled}
          onChange={setVatEnabled}
          savingsNote={vatEnabled ? 'НӨАТ нэмэгдэнэ' : 'НӨАТ хасагдсан'}
        />
      </div>

      {/* Files */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Анализд ашигласан зургууд</h3>
        </div>
        <div className="border border-slate-800 bg-slate-950/40 divide-y divide-slate-900">
          {files && files.length > 0 ? files.map((f, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 bg-blue-950/60 border border-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{f.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {f.pages ? `${f.pages} хуудас · ` : ''}{f.format || 'PDF'}{f.sizeLabel ? ` · ${f.sizeLabel}` : ''}
                  </div>
                </div>
              </div>
              <div className="text-[10px] px-2 py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Боловсруулсан
              </div>
            </div>
          )) : (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              Ажлын зураг байхгүй байна
            </div>
          )}
        </div>
      </div>

      {/* Export + Reset */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 font-semibold">Үйлдэл</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onExportJSON}
            className="px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <FileJson className="w-4 h-4" />
            <span>JSON экспорт</span>
          </button>
          <button
            onClick={onExportCSV}
            className="px-4 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV (Excel)</span>
          </button>
          <button
            onClick={onReset}
            className="px-4 py-4 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-800 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Анхны утгад</span>
          </button>
          <button
            onClick={onFullReset}
            className="px-4 py-4 bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-800 hover:border-red-900 text-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Шинээр эхлүүлэх</span>
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-8 p-4 bg-slate-950/60 border border-slate-800">
        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">Систем мэдээлэл</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <InfoBit label="Үнийн сан" value="Улаанбаатар Q1 2026" />
          <InfoBit label="Норм" value="БНбД 43-101, 43-103" />
          <InfoBit label="AI хөдөлгүүр" value="Murch Vision v3.0" />
          <InfoBit label="Нийт нэр төрөл" value="120+ үндсэн · 50+ туслах" />
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ icon, title, desc, checked, onChange, savingsNote }) {
  return (
    <div className={`p-5 border-2 transition-all ${
      checked ? 'border-blue-700 bg-blue-950/20' : 'border-slate-800 bg-slate-950/40'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className={checked ? 'text-blue-400' : 'text-slate-500'}>{icon}</div>
          <h4 className="font-display text-sm font-bold text-white">{title}</h4>
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-12 h-6 transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-700'}`}
          aria-label={title}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
        </button>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{desc}</p>
      <div className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${checked ? 'text-blue-400' : 'text-slate-500'}`}>
        <CircleDot className="w-3 h-3" />
        <span>{savingsNote}</span>
      </div>
    </div>
  );
}

function InfoBit({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white mt-0.5 font-mono-tab">{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE PREVIEW — formal BOQ proposal modal
// ═══════════════════════════════════════════════════════════════════════════
function QuotePreview({
  onClose, sectionTotals, auxiliaryData, auxTotals,
  mainSubtotal, auxSubtotal, grandSubtotal, totalLabor, totalMaterial,
  synergy, synergyDiscount, afterDiscount,
  vatEnabled, vat, finalTotal,
  tier, tierMultiplier, files,
  onExportJSON, onExportCSV
}) {
  const tierLabel = TIER_OPTIONS.find(t => t.id === tier)?.label || 'Standard';
  const today = new Date();
  const docNo = `MV-${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}-${PROJECT_META.code}`;
  const validUntil = new Date(today.getTime() + 30 * 86400000);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative h-full flex flex-col">
        {/* Action bar — fixed at top */}
        <div className="flex-shrink-0 bg-slate-950/95 border-b border-slate-800 backdrop-blur-sm print:hidden">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Preview</div>
                <div className="font-display text-sm font-bold text-white">Үнийн санал</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Хэвлэх
              </button>
              <button
                onClick={onExportJSON}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
              <button
                onClick={onExportCSV}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs flex items-center gap-2 border border-slate-800 hover:border-red-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Хаах
              </button>
            </div>
          </div>
        </div>

        {/* Document scroll area */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="max-w-[900px] mx-auto my-6 bg-white text-slate-900 shadow-2xl print:shadow-none print:my-0 print:max-w-full slide-up">
            {/* Document header */}
            <div className="p-10 border-b-2 border-slate-900">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <Logo height={32} inverted />
                  <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    AI-powered BOQ · Construction Cost Estimate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Баримт №</div>
                  <div className="font-mono-tab text-sm font-bold text-slate-900">{docNo}</div>
                  <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">Огноо</div>
                  <div className="font-mono-tab text-sm text-slate-900">
                    {today.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-1">
                Ажлын зардлын хэмжээ (BOQ)
              </h1>
              <div className="text-lg text-slate-700 mb-4">{PROJECT_META.name} <span className="text-slate-500 text-base">/ {PROJECT_META.subtitle} /</span></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-200">
                <QuoteInfo label="Захиалагч" value={PROJECT_META.clients} />
                <QuoteInfo label="Байршил" value={PROJECT_META.location} />
                <QuoteInfo label="Талбай" value={PROJECT_META.area} />
                <QuoteInfo label="Үнэ хүчинтэй" value={validUntil.toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })} />
              </div>
            </div>

            {/* Executive summary box */}
            <div className="px-10 py-8 bg-slate-50 border-b border-slate-200">
              <div className="text-[10px] uppercase tracking-[0.25em] text-blue-700 mb-3 font-semibold">Нэгдсэн дүн</div>
              <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Эцсийн нийт дүн ({vatEnabled ? 'НӨАТ-тай' : 'НӨАТ-гүй'})</div>
                  <div className="font-display text-5xl font-extrabold text-blue-700 ticker">
                    {formatMNT(finalTotal)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Материалын түвшин</div>
                  <div className="font-display text-lg font-bold text-slate-900">{tierLabel}</div>
                  <div className="text-xs text-slate-600">үржигч ×{tierMultiplier.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryTile label="Үндсэн материал" value={formatShort(totalMaterial) + '₮'} />
                <SummaryTile label="Ажлын хөлс" value={formatShort(totalLabor) + '₮'} />
                <SummaryTile label="Туслах материал" value={formatShort(auxSubtotal) + '₮'} emerald />
                <SummaryTile label={synergy ? 'SQUAD хэмнэлт' : 'Хөнгөлөлт'} value={synergy ? '−' + formatShort(synergyDiscount) + '₮' : '—'} amber={synergy} />
              </div>
            </div>

            {/* Section-by-section table */}
            <div className="p-10">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-4 font-semibold flex items-center gap-2">
                <Package className="w-3 h-3" /> BOQ задаргаа
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">№</th>
                    <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Хэсэг</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Мөр</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Материал</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Ажил</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Туслах</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Дэд дүн</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionTotals.map((sec, i) => {
                    const secAux = auxTotals[sec.id] || 0;
                    const secTotal = sec.subtotal + secAux;
                    return (
                      <tr key={sec.id} className="border-b border-slate-200">
                        <td className="py-3 px-2 font-mono-tab text-xs text-slate-500">{i + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6" style={{ background: sec.color }}></div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{sec.name}</div>
                              <div className="text-[10px] text-slate-500">{sec.itemCount} нэр төрөл</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-600">{sec.itemCount}</td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-700">{formatShort(sec.material)}₮</td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-700">{formatShort(sec.labor)}₮</td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-emerald-700">{formatShort(secAux)}₮</td>
                        <td className="py-3 px-2 text-right font-mono-tab text-sm font-bold text-slate-900">{formatShort(secTotal)}₮</td>
                      </tr>
                    );
                  })}
                  <tr className="border-b-2 border-slate-900 bg-slate-100">
                    <td></td>
                    <td className="py-3 px-2 font-display font-bold text-slate-900 uppercase text-xs tracking-wider">Дэд дүн</td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-600">
                      {sectionTotals.reduce((s, x) => s + x.itemCount, 0)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs font-bold text-slate-900">{formatShort(totalMaterial)}₮</td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs font-bold text-slate-900">{formatShort(totalLabor)}₮</td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs font-bold text-emerald-700">{formatShort(auxSubtotal)}₮</td>
                    <td className="py-3 px-2 text-right font-mono-tab text-sm font-bold text-blue-700">{formatShort(grandSubtotal)}₮</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculation ladder */}
            <div className="px-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3 font-semibold flex items-center gap-2">
                <Calculator className="w-3 h-3" /> Үнэлгээний тооцоолол
              </div>
              <div className="border border-slate-200 bg-slate-50">
                <QuoteCalcRow label="Үндсэн материал" value={formatMNT(totalMaterial)} sub={`Түвшин: ${tierLabel} · үржигч ×${tierMultiplier.toFixed(2)}`} />
                <QuoteCalcRow label="Ажлын хөлс" value={formatMNT(totalLabor)} sub="Угсралт, суурилуулалт, туршилт" />
                <QuoteCalcRow label="Туслах материал (БНбД auto)" value={formatMNT(auxSubtotal)} sub="Бэхэлгээ · Холбогч · Тусгаарлалт · Газардуулга" emerald />
                <QuoteCalcRow label="Дэд дүн" value={formatMNT(grandSubtotal)} bold />
                {synergy && (
                  <QuoteCalcRow label="SQUAD Synergy хөнгөлөлт (−10% ажлын хөлс)" value={'− ' + formatMNT(synergyDiscount)} amber />
                )}
                {synergy && (
                  <QuoteCalcRow label="Хөнгөлөлтийн дараа" value={formatMNT(afterDiscount)} bold />
                )}
                {vatEnabled && (
                  <QuoteCalcRow label="НӨАТ (+10%)" value={'+ ' + formatMNT(vat)} amber />
                )}
                <div className="border-t-2 border-slate-900 bg-blue-50 px-4 py-4 flex items-center justify-between">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-blue-700">Эцсийн нийт дүн</div>
                  <div className="font-display text-3xl font-extrabold text-blue-700 ticker">{formatMNT(finalTotal)}</div>
                </div>
              </div>
            </div>

            {/* Auxiliary breakdown */}
            <div className="px-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-700 mb-3 font-semibold flex items-center gap-2">
                <Wrench className="w-3 h-3" /> Туслах материалын задаргаа (БНбД-ээр автомат)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['cctv', 'fire', 'intercom', 'electrical'].map(sk => {
                  const sec = sectionTotals.find(s => s.id === sk);
                  const items = auxiliaryData[sk] || [];
                  const total = auxTotals[sk] || 0;
                  if (!sec) return null;
                  return (
                    <div key={sk} className="p-3 border border-slate-200 bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4" style={{ background: sec.color }}></div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold truncate">{sec.shortName}</div>
                      </div>
                      <div className="font-mono-tab text-base font-bold text-emerald-700">{formatShort(total)}₮</div>
                      <div className="text-[10px] text-slate-500">{items.length} нэр төрөл</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms */}
            <div className="px-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3 font-semibold flex items-center gap-2">
                <Info className="w-3 h-3" /> Тэмдэглэл · Нөхцөл
              </div>
              <div className="border-l-2 border-slate-900 pl-4 space-y-2 text-xs text-slate-700">
                <p>• Үнэлгээ нь <strong>Улаанбаатар Q1 2026</strong> оны зах зээлийн үнэ, БНбД 43-101-18 болон БНбД 43-103-18 нормд тулгуурлан гаргав.</p>
                <p>• Туслах материалын тоо хэмжээг үндсэн материалын тоо ширхэг, кабелийн уртаас автомат тооцоолсон (+15% нөөц).</p>
                <p>• Материалын чанарын түвшин: <strong>{tierLabel}</strong> (×{tierMultiplier.toFixed(2)} үржигч).</p>
                {synergy && <p>• SQUAD нэгдлийн гишүүн компаниар гүйцэтгэгч байгуулбал ажлын хөлснөөс 10% хасагдана.</p>}
                {vatEnabled && <p>• Эцсийн дүнд 10% НӨАТ нэмэгдсэн.</p>}
                <p>• Үнийн санал {validUntil.toLocaleDateString('mn-MN')} хүртэл хүчинтэй.</p>
                <p>• Анализад ашигласан зураг: {files && files.length > 0 ? files.map(f => f.name).join(', ') : 'Бросс-С блок ХД/ХТ/ДГ зураг'}.</p>
              </div>
            </div>

            {/* Signature area */}
            <div className="px-10 py-8 bg-slate-50 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-8 font-semibold">Гүйцэтгэгч</div>
                <div className="border-b border-slate-400 mb-1 h-8"></div>
                <div className="text-xs text-slate-700">(Гарын үсэг · Тамга)</div>
                <div className="text-xs text-slate-500 mt-4 font-mono-tab">Murch Vision AI Estimator v3.0</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-8 font-semibold">Захиалагч</div>
                <div className="border-b border-slate-400 mb-1 h-8"></div>
                <div className="text-xs text-slate-700">(Гарын үсэг · Тамга)</div>
                <div className="text-xs text-slate-500 mt-4">{PROJECT_META.clients}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-4 text-center border-t border-slate-200 bg-slate-100">
              <div className="text-[10px] text-slate-500">
                Энэхүү баримт бичгийг Murch Vision AI Estimator-ийн тусламжтайгаар автоматаар боловсруулсан болно ·
                {' '}Баримт № {docNo} · {today.toLocaleDateString('mn-MN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteInfo({ label, value }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-0.5 font-semibold">{label}</div>
      <div className="text-xs text-slate-900 font-medium">{value}</div>
    </div>
  );
}

function SummaryTile({ label, value, emerald, amber }) {
  return (
    <div className="p-3 bg-white border border-slate-200">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">{label}</div>
      <div className={`font-mono-tab text-base font-bold ${
        emerald ? 'text-emerald-700' : amber ? 'text-amber-700' : 'text-slate-900'
      }`}>{value}</div>
    </div>
  );
}

function QuoteCalcRow({ label, value, bold, amber, emerald, sub }) {
  return (
    <div className={`px-4 py-3 flex items-center justify-between gap-4 border-b border-slate-200 last:border-b-0 ${bold ? 'bg-white' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{label}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div className={`font-mono-tab whitespace-nowrap ${
        bold ? 'text-base font-bold text-slate-900' :
        amber ? 'text-sm text-amber-700 font-semibold' :
        emerald ? 'text-sm text-emerald-700 font-semibold' :
        'text-sm text-slate-800'
      }`}>{value}</div>
    </div>
  );
}
