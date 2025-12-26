import PortalLayout from "@/components/portal/PortalLayout";
import { ShoppingBag, Star, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

const Store = () => {
  const { 
    products, 
    isLoading, 
    cart, 
    addToCart, 
    updateQuantity,
    cartTotal, 
    cartItemCount 
  } = useProducts();

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

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
          {products.map((product) => {
            const cartItem = cart.find(item => item.product.id === product.id);
            const quantity = cartItem?.quantity || 0;
            
            return (
              <div 
                key={product.id}
                className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Product Image */}
                <div className="h-48 bg-muted/30 flex items-center justify-center text-6xl">
                  {product.image_url || '📦'}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{product.rating || 5.0}</span>
                  </div>

                  <h3 className="font-display text-xl mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground line-through text-sm">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className="font-display text-2xl text-primary ml-2">
                        ${Number(product.member_price).toFixed(2)}
                      </span>
                    </div>
                    
                    {quantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium w-8 text-center">{quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => addToCart(product)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No products available</p>
            <p className="text-sm">Check back soon for new items!</p>
          </div>
        )}

        {/* Cart Summary */}
        <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 lg:w-80">
          <div className="bg-secondary text-secondary-foreground rounded-xl p-4 shadow-xl border border-border/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-medium">Cart</span>
              </div>
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {cartItemCount} items
              </span>
            </div>
            <Button variant="hero" className="w-full" disabled={cartItemCount === 0}>
              Checkout • ${cartTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Store;
