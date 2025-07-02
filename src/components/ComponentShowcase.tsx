
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { FormFieldEnhanced } from '@/components/ui/form-field-enhanced';
import { Mail, User, Star, Heart, Search } from 'lucide-react';

const ComponentShowcase = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="heading-xl text-gradient-luxe">Component Showcase</h1>
        <p className="body-lg">Enhanced components using our design token system</p>
      </div>

      {/* Card Variants */}
      <section className="space-y-6">
        <h2 className="heading-md">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with default styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This is the default card variant.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with shadow and hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This card has enhanced shadows.</p>
            </CardContent>
          </Card>

          <Card variant="premium">
            <CardHeader>
              <CardTitle variant="gradient">Premium Card</CardTitle>
              <CardDescription>Premium styling with gradient background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This is a premium card with gradient styling.</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Glassmorphism effect with backdrop blur</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This card uses glassmorphism effects.</p>
            </CardContent>
          </Card>

          <Card variant="luxury">
            <CardHeader>
              <CardTitle>Luxury Card</CardTitle>
              <CardDescription>Luxury styling with gold gradient</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is a luxury card with gold styling.</p>
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Clickable card with hover animations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This card responds to user interaction.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-6">
        <h2 className="heading-md">Button Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="luxury">Luxury</Button>
          <Button variant="premium">Premium</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="error">Error</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Button Sizes */}
      <section className="space-y-6">
        <h2 className="heading-md">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm" variant="luxury">Small</Button>
          <Button size="default" variant="luxury">Default</Button>
          <Button size="lg" variant="luxury">Large</Button>
          <Button size="xl" variant="luxury">Extra Large</Button>
          <Button size="icon" variant="luxury"><Star className="w-4 h-4" /></Button>
          <Button size="icon-sm" variant="luxury"><Heart className="w-3 h-3" /></Button>
          <Button size="icon-lg" variant="luxury"><Search className="w-5 h-5" /></Button>
        </div>
      </section>

      {/* Button Animations */}
      <section className="space-y-6">
        <h2 className="heading-md">Button Animations</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="premium" animation="press">Press Animation</Button>
          <Button variant="premium" animation="lift">Lift Animation</Button>
          <Button variant="premium" animation="glow">Glow Animation</Button>
          <Button variant="premium" animation="bounce">Bounce Animation</Button>
          <Button variant="premium" animation="none">No Animation</Button>
        </div>
      </section>

      {/* Form Components */}
      <section className="space-y-6">
        <h2 className="heading-md">Form Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Enhanced Form Fields</CardTitle>
              <CardDescription>Form fields with integrated design tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldEnhanced
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startIcon={<Mail className="w-4 h-4" />}
                description="We'll never share your email"
                required
              />
              
              <FormFieldEnhanced
                label="Full Name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                startIcon={<User className="w-4 h-4" />}
                inputVariant="filled"
                required
              />
              
              <FormFieldEnhanced
                label="Search"
                type="text"
                placeholder="Search..."
                inputVariant="outline"
                startIcon={<Search className="w-4 h-4" />}
                inputSize="lg"
              />
              
              <FormFieldEnhanced
                label="Underline Style"
                type="text"
                placeholder="Type here..."
                inputVariant="flushed"
              />
              
              <FormFieldEnhanced
                label="Ghost Style"
                type="text"
                placeholder="Minimal input..."
                inputVariant="ghost"
              />
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Form States</CardTitle>
              <CardDescription>Different input states and loading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldEnhanced
                label="Success State"
                type="text"
                placeholder="Valid input"
                inputState="success"
                description="This field looks good!"
              />
              
              <FormFieldEnhanced
                label="Error State"
                type="text"
                placeholder="Invalid input"
                inputState="error"
                error="This field has an error"
              />
              
              <FormFieldEnhanced
                label="Warning State"
                type="text"
                placeholder="Warning input"
                inputState="warning"
                description="Please check this field"
              />
              
              <FormFieldEnhanced
                label="Loading State"
                type="text"
                placeholder="Loading..."
                loading
                description="Processing your input..."
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="space-y-6">
        <h2 className="heading-md">Action Examples</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="luxury" size="lg" animation="lift">
            <Star className="w-4 h-4 mr-2" />
            Get Premium
          </Button>
          <Button variant="success" size="lg" animation="glow">
            Save Changes
          </Button>
          <Button variant="outline" size="lg" animation="press">
            Cancel
          </Button>
          <Button variant="glass" size="lg" loading>
            Processing...
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ComponentShowcase;
