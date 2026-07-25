import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChefHat, LayoutDashboard, UtensilsCrossed, ShieldCheck, Package } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";

export function LandingPage() {
  const features = [
    {
      title: "Kitchen Display System (KDS)",
      description: "Kanban order tickets with live status progression (Pending → Cooking → Ready → Served).",
      icon: ChefHat,
    },
    {
      title: "Visual Table Floor Plan",
      description: "Real-time table occupancy status, capacity tracking, and seating assignments.",
      icon: LayoutDashboard,
    },
    {
      title: "Digital Customer Menu & Cart",
      description: "Interactive category browsing, dietary tags, instant cart ordering, and live receipt tracking.",
      icon: UtensilsCrossed,
    },
    {
      title: "Automated Stock & Inventory",
      description: "Real-time raw ingredient tracking with automated low-stock warnings and restock controls.",
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="page-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              R
            </div>
            RestaurantOS
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to={ROUTES.login}>Sign in</Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.signup}>Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="space-y-24 py-16">
        <section className="page-container text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              AI-Powered Restaurant Operating System
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Run your restaurant with intelligence, not guesswork
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              RestaurantOS unifies kitchen operations, table management, inventory,
              and customer dining experiences into one seamless, production-quality SaaS platform.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
              <Button size="lg" asChild className="gap-2">
                <Link to={ROUTES.signup}>
                  Start Free Trial <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.login}>Explore Interactive Demo</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="page-container">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-background p-8 space-y-6 text-center">
            <div className="space-y-2 max-w-xl mx-auto">
              <Badge variant="outline" className="mx-auto">Try Live Demos</Badge>
              <h2 className="text-2xl font-bold">Instant Role Persona Access</h2>
              <p className="text-sm text-muted-foreground">
                Experience RestaurantOS from every perspective — Customer, Staff, or Admin.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 text-center">
                  <UtensilsCrossed className="size-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-base">Customer Portal</CardTitle>
                  <CardDescription className="text-xs">Digital menu, cart, table booking & live order tracking</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to={ROUTES.customer.home}>Launch Customer View</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 text-center">
                  <ChefHat className="size-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-base">Staff & Kitchen KDS</CardTitle>
                  <CardDescription className="text-xs">Kanban tickets, table floor plan & order fulfillment</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to={ROUTES.staff.kitchen}>Launch Kitchen KDS</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 text-center">
                  <ShieldCheck className="size-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-base">Admin Console</CardTitle>
                  <CardDescription className="text-xs">Revenue analytics, menu CRUD, stock control & staff roster</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to={ROUTES.admin.dashboard}>Launch Admin Console</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="page-container space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Built for Modern Hospitality Operations</h2>
            <p className="text-sm text-muted-foreground">
              Everything your restaurant needs to streamline service, reduce ticket wait times, and increase profitability.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="p-6 space-y-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-base">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="page-container text-center text-sm text-muted-foreground">
          © 2026 RestaurantOS · Vibeathon 6.0 Enterprise SaaS
        </div>
      </footer>
    </div>
  );
}
