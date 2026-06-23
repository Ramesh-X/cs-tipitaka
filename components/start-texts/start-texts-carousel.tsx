'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Pali } from '@/components/reader/pali';

interface StartText {
  title: string;
  pali: string;
  note: string;
  href: string;
}

const TEXTS: StartText[] = [
  // Page 1 — beloved and widely known
  {
    title: 'Dhammapada',
    pali: 'Dhammapadapāḷi',
    note: 'The path of truth — 423 verses',
    href: '/sutta/kn/dhammapadapali',
  },
  {
    title: 'Karaṇīya Mettā Sutta',
    pali: 'Mettasuttaṃ',
    note: 'Boundless loving-kindness',
    href: '/sutta/kn/khuddakapathapali/mettasuttam',
  },
  {
    title: 'Maṅgala Sutta',
    pali: 'Maṅgalasuttaṃ',
    note: 'The highest blessings',
    href: '/sutta/kn/khuddakapathapali/manggalasuttam',
  },
  {
    title: 'Ratana Sutta',
    pali: 'Ratanasuttaṃ',
    note: 'The jewels of the Triple Gem',
    href: '/sutta/kn/khuddakapathapali/ratanasuttam',
  },
  {
    title: 'Sāmaññaphala Sutta',
    pali: 'Sāmaññaphalasuttaṃ',
    note: 'The fruits of the ascetic life',
    href: '/sutta/dn/silakkhandhavaggapali/samannaphalasuttam',
  },
  {
    title: 'Mahāparinibbāna Sutta',
    pali: 'Mahāparinibbānasuttaṃ',
    note: "The Buddha's final journey and passing",
    href: '/sutta/dn/mahavaggapali/mahaparinibbanasuttam',
  },
  // Page 2 — practice and meditation
  {
    title: 'Mahāsatipaṭṭhāna Sutta',
    pali: 'Mahāsatipaṭṭhānasuttaṃ',
    note: 'The four foundations of mindfulness',
    href: '/sutta/dn/mahavaggapali/mahasatipatthanasuttam',
  },
  {
    title: 'Ānāpānasaṃyuttaṃ',
    pali: 'Ānāpānasaṃyuttaṃ',
    note: 'Mindfulness of breathing',
    href: '/sutta/sn/mahavaggapali/anapanasamyuttam',
  },
  {
    title: 'Bojjhaṅgasaṃyuttaṃ',
    pali: 'Bojjhaṅgasaṃyuttaṃ',
    note: 'The seven factors of awakening',
    href: '/sutta/sn/mahavaggapali/bojjhanggasamyuttam',
  },
  {
    title: 'First Discourse',
    pali: 'Dhammacakkappavattana',
    note: 'The first turning of the Wheel of Dhamma',
    href: '/sutta/sn/mahavaggapali/saccasamyuttam',
  },
  {
    title: 'Maggasaṃyuttaṃ',
    pali: 'Maggasaṃyuttaṃ',
    note: 'The Noble Eightfold Path',
    href: '/sutta/sn/mahavaggapali/maggasamyuttam',
  },
  {
    title: 'Satipaṭṭhānasaṃyuttaṃ',
    pali: 'Satipaṭṭhānasaṃyuttaṃ',
    note: 'Mindfulness — the direct path',
    href: '/sutta/sn/mahavaggapali/satipatthanasamyuttam',
  },
  // Page 3 — study and doctrinal depth
  {
    title: 'Brahmajāla Sutta',
    pali: 'Brahmajālasuttaṃ',
    note: 'The 62 wrong views — and what lies beyond them',
    href: '/sutta/dn/silakkhandhavaggapali/brahmajalasuttam',
  },
  {
    title: 'Sigālovāda Sutta',
    pali: 'Siṅgālasuttaṃ',
    note: 'Ethical guidance for lay life',
    href: '/sutta/dn/pathikavaggapali/singgalasuttam',
  },
  {
    title: 'Mahānidāna Sutta',
    pali: 'Mahānidānasuttaṃ',
    note: 'Dependent origination in full',
    href: '/sutta/dn/mahavaggapali/mahanidanasuttam',
  },
  {
    title: 'Khuddakapāṭha',
    pali: 'Khuddakapāṭhapāḷi',
    note: 'Nine short texts for study and chanting',
    href: '/sutta/kn/khuddakapathapali',
  },
  {
    title: 'Sutta Nipāta — Uragavaggo',
    pali: 'Uragavaggo',
    note: "Early poetry of the Buddha's teaching",
    href: '/sutta/kn/suttanipatapali/uragavaggo',
  },
  {
    title: 'Theragāthā',
    pali: 'Theragāthāpāḷi',
    note: 'Poems of awakening by the elder monks',
    href: '/sutta/kn/theragathapali/ekakanipato',
  },
];

const PAGE_SIZE = 6;
const TOTAL_PAGES = Math.ceil(TEXTS.length / PAGE_SIZE);

export function StartTextsCarousel() {
  const [page, setPage] = React.useState(0);

  const advance = React.useCallback(
    () => setPage((p) => (p + 1) % TOTAL_PAGES),
    [],
  );

  // Auto-advance every 7 s; reset the timer on manual navigation so the
  // interval always starts fresh from the moment the user last interacted.
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 7000);
  }, [advance]);

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  function go(next: number) {
    setPage(next);
    resetTimer();
  }

  const items = TEXTS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex h-full items-start justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <span className="flex flex-col">
                <span className="font-medium">{t.title}</span>
                <span className="font-reading text-sm text-muted-foreground">
                  <Pali text={t.pali} />
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t.note}
                </span>
              </span>
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => go((page - 1 + TOTAL_PAGES) % TOTAL_PAGES)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2" aria-label="Page indicator">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? 'true' : undefined}
              className={`size-2 rounded-full transition-colors ${
                i === page
                  ? 'bg-foreground'
                  : 'bg-border hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => go((page + 1) % TOTAL_PAGES)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
