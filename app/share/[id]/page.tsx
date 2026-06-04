import { Metadata } from 'next'
import { existsSync } from 'fs'
import path from 'path'
import Image from 'next/image'
import Link from 'next/link'

interface Props { params: Promise<{ id: string }> }

const SITE_URL = process.env.NEXTAUTH_URL || 'https://letsthinkpositive.com'

function getImageUrl(id: string) {
  const clean = id.replace(/[^a-f0-9]/gi, '') // sanitise — hex only
  const file  = path.join(process.cwd(), 'public', 'uploads', 'shared', `${clean}.png`)
  if (!existsSync(file)) return null
  return `${SITE_URL}/uploads/shared/${clean}.png`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }    = await params
  const imageUrl  = getImageUrl(id)

  if (!imageUrl) {
    return { title: 'Quote Card | Let\'s Think Positive' }
  }

  return {
    title:       'Quote Card | Let\'s Think Positive',
    description: 'A positive quote card — where every thought begins with hope.',
    openGraph: {
      title:       'Quote Card | Let\'s Think Positive',
      description: 'A positive quote card — where every thought begins with hope.',
      url:         `${SITE_URL}/share/${id}`,
      siteName:    'Let\'s Think Positive',
      images: [{
        url:    imageUrl,
        width:  1200,
        height: 630,
        alt:    'Quote card from letsthinkpositive.com',
      }],
      type: 'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       'Quote Card | Let\'s Think Positive',
      description: 'A positive quote card — where every thought begins with hope.',
      images:      [imageUrl],
      site:        '@letsthinkpos',
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { id }   = await params
  const imageUrl = getImageUrl(id)

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory px-4 text-center">
        <p className="text-[2rem] mb-4">🌿</p>
        <h1 className="font-display text-[1.5rem] font-bold text-charcoal mb-2">Card not found</h1>
        <p className="text-text-mid text-[0.9rem] mb-6">This quote card may have expired. Create a new one!</p>
        <Link href="/quotes" className="bg-teal-deep text-white px-6 py-2.5 rounded-full text-[0.9rem] hover:bg-teal-dark transition-colors">
          Create a Quote Card
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9f4] px-4 py-12">
      {/* Card image */}
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-lift mb-8">
        <Image
          src={`/uploads/shared/${id.replace(/[^a-f0-9]/gi, '')}.png`}
          alt="Quote card"
          width={1200}
          height={630}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* CTA */}
      <p className="text-text-mid text-[0.88rem] mb-4 text-center">
        Made with 💛 on <strong>Let&apos;s Think Positive</strong>
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/quotes"
          className="bg-teal-deep text-white px-6 py-2.5 rounded-full text-[0.88rem] font-medium hover:bg-teal-dark transition-colors shadow-sm">
          Create Your Own Card
        </Link>
        <Link href="/"
          className="border border-teal-light text-teal-deep px-6 py-2.5 rounded-full text-[0.88rem] font-medium hover:bg-teal-ghost transition-colors">
          Explore the Site
        </Link>
      </div>
    </div>
  )
}
