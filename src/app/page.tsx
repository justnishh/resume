import Link from 'next/link'
import Image from 'next/image'

async function getFeaturedItems() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/menu-items`, { 
    cache: 'no-store' 
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.items?.slice(0, 6) || []
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories`, { 
    cache: 'no-store' 
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.categories || []
}

export default async function Home() {
  const [items, categories] = await Promise.all([getFeaturedItems(), getCategories()])

  return (
    <div>
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image 
            src="https://picsum.photos/seed/herobg/1920/1080"
            alt="Restaurant background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-4">
            Delicious Food,<br />Delivered Fast
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Order your favorite meals from the comfort of your home
          </p>
          <Link 
            href="/menu" 
            className="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition-all hover:scale-105"
          >
            Order Now
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-heading font-bold text-center mb-12">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat: { id: string; name: string; slug: string }) => (
            <Link 
              key={cat.id} 
              href={`/menu?category=${cat.slug}`}
              className="bg-surface p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center border border-border"
            >
              <h3 className="font-heading font-semibold text-secondary">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Popular Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: { id: string; name: string; description: string; price: number; image: string }) => (
              <div key={item.id} className="bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image 
                    src={item.image || 'https://picsum.photos/seed/food/400/300'} 
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-muted text-sm line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-xl">${item.price.toFixed(2)}</span>
                    <Link 
                      href="/menu"
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/menu"
              className="inline-block border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-4">About Foodie</h2>
            <p className="text-muted mb-4">
              We have been serving delicious food to our community for over 10 years. 
              Our commitment to quality ingredients and exceptional service has made us 
              a favorite for food delivery.
            </p>
            <p className="text-muted">
              Order online and enjoy restaurant-quality meals at home!
            </p>
          </div>
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/restaurant/800/600"
              alt="Restaurant interior"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}