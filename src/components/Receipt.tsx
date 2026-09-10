import Image from 'next/image'
import { OUTLET } from '@/data/outlet'
import { formatAmount, formatToken } from '@/lib/money'
import type { Order } from '@/lib/types'

type ReceiptProps = {
  order: Order
}

const PAYMENT_LABEL: Record<Order['payment'], string> = {
  cash: 'CASH',
  upi: 'UPI',
  card: 'CARD',
}

/*
 * An 80mm thermal receipt, headed with the café logo.
 *
 * About that logo: it is /logo-print.png, a 1-bit black-on-white rendering
 * generated from the WHITE-background artwork in the brand PDF. That source
 * matters. The dark-background version is drawn with cream outlines, so on
 * white receipt paper it would print as a pale smudge. A thermal printer has
 * exactly two states per dot — burned or blank — so the image is thresholded
 * to pure black and white rather than left as greyscale, which would come out
 * as muddy dithering.
 *
 * Two Image props here are load-bearing, not tweaks:
 *
 *   priority     Next.js lazy loads images by default, and a lazily loaded
 *                image is often still missing when the print dialog opens,
 *                giving you a bill with a blank header.
 *   unoptimized  The image optimiser would re-encode this through a LOSSY
 *                pipeline at quality 75 and upscale it, reintroducing exactly
 *                the grey fringing that thresholding removed. Serving the
 *                1-bit PNG untouched is the whole point.
 *
 * The `receipt-sheet` class is styled in globals.css under `@media print`,
 * which is what fixes the paper width to 80mm.
 */
export default function Receipt({ order }: ReceiptProps) {
  const placed = new Date(order.placedAt)

  return (
    <div className="receipt-sheet mx-auto bg-white p-4 font-mono text-[11px] leading-tight text-black">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/logo-print.png"
          alt={OUTLET.name}
          width={384}
          height={431}
          priority
          unoptimized
          className="mb-2 h-auto w-[46mm]"
        />
        {/* The name and tagline are already inside the logo artwork, so only
            the details it does not carry are repeated as text here. */}
        {OUTLET.addressLines.map((line) => (
          <p key={line} className="text-[9px]">
            {line}
          </p>
        ))}
        <p className="text-[9px]">Ph: {OUTLET.phone}</p>
      </div>

      <Rule />

      <div className="flex justify-between">
        <span className="font-bold">TOKEN {formatToken(order.token)}</span>
        <span>
          {placed.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Bill {order.id.slice(0, 8).toUpperCase()}</span>
        <span>
          {placed.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <Rule />

      <table className="w-full tabular-nums">
        <thead>
          <tr className="text-left text-[10px]">
            <th className="pb-1 font-bold">ITEM</th>
            <th className="pb-1 text-center font-bold">QTY</th>
            <th className="pb-1 text-right font-bold">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.itemId} className="align-top">
              <td className="py-0.5 pr-2">{line.name}</td>
              <td className="py-0.5 text-center">{line.qty}</td>
              <td className="py-0.5 text-right">{formatAmount(line.unitPriceP * line.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Rule />

      <div className="flex justify-between text-[14px] font-bold tabular-nums">
        <span>TOTAL</span>
        <span>{formatAmount(order.totalP)}</span>
      </div>
      <p className="mt-1 text-[10px]">Paid by {PAYMENT_LABEL[order.payment]}</p>
      <p className="text-[9px]">Prices are inclusive. No tax applied.</p>

      <Rule />

      <p className="text-center text-[10px] font-bold">RIDE SAFE. COME BACK THIRSTY.</p>
    </div>
  )
}

function Rule() {
  return <div className="my-2 border-t border-dashed border-black" />
}
