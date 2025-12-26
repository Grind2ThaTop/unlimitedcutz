import PortalLayout from "@/components/portal/PortalLayout";
import { ShoppingBag, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "Premium Beard Oil",
    description: "Nourishing blend of argan and jojoba oils",
    price: 24.99,
    memberPrice: 19.99,
    image: "🧴",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Styling Pomade",
    description: "Medium hold with natural shine",
    price: 18.99,
    memberPrice: 14.99,
    image: "💈",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Magnetic Hair Tonic",
    description: "Revitalizing scalp treatment",
    price: 29.99,
    memberPrice: 24.99,
    image: "💧",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Shave Butter",
    description: "Ultra-smooth shaving cream",
    price: 15.99,
    memberPrice: 12.99,
    image: "🪒",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Magnetic T-Shirt",
    description: "Premium cotton, embroidered logo",
    price: 34.99,
    memberPrice: 29.99,
    image: "👕",
    rating: 5.0,
  },
  {
    id: 6,
    name: "Grooming Kit",
    description: "Complete set with travel case",
    price: 79.99,
    memberPrice: 64.99,
    image: "🎁",
    rating: 4.9,
  },
];

const Store = () => {
  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Product Store</h1>
          <p className="text-muted-foreground">
            Exclusive member pricing on premium grooming products
          </p>
        </div>

        {/* Commission Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="font-display text-xl mb-1">Earn on Every Sale</h3>
              <p className="text-muted-foreground text-sm">
                Get <span className="text-primary font-semibold">25% commission</span> on your personal sales, 
                plus matrix commissions on your network's purchases.
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Product Image */}
              <div className="h-48 bg-muted/30 flex items-center justify-center text-6xl">
                {product.image}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>

                <h3 className="font-display text-xl mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground line-through text-sm">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="font-display text-2xl text-primary ml-2">
                      ${product.memberPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 lg:w-80">
          <div className="bg-secondary text-secondary-foreground rounded-xl p-4 shadow-xl border border-border/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-medium">Cart</span>
              </div>
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                0 items
              </span>
            </div>
            <Button variant="hero" className="w-full" disabled>
              Checkout • $0.00
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Store;
