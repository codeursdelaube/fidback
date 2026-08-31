-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRIAL');
CREATE TYPE "ServiceVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable companies
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "logoUrl" TEXT,
    "city" TEXT DEFAULT 'Lomé, Togo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable services
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "ServiceVisibility" NOT NULL DEFAULT 'PUBLIC',
    "category" TEXT DEFAULT 'Technologie & App',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable feedbacks
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "constructiveScore" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable update_announcements
CREATE TABLE "update_announcements" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_pseudo_key" ON "users"("pseudo");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");
CREATE UNIQUE INDEX "subscriptions_userId_serviceId_key" ON "subscriptions"("userId", "serviceId");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "update_announcements" ADD CONSTRAINT "update_announcements_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- SECURE ROW LEVEL SECURITY (RLS) POLICIES USING auth.uid()
-- =========================================================================

-- Enable RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedbacks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "update_announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

-- 1. USERS
CREATE POLICY "Users can read own profile" ON "users"
    FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON "users"
    FOR UPDATE USING (auth.uid()::text = id);

-- 2. COMPANIES
CREATE POLICY "Public can view company names" ON "companies"
    FOR SELECT USING (true);
CREATE POLICY "Companies can manage own record" ON "companies"
    FOR ALL USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

-- 3. SERVICES
-- Lecture publique des services publics, ou privée par l'entreprise propriétaire
CREATE POLICY "Services viewable if public or owner" ON "services"
    FOR SELECT USING (visibility = 'PUBLIC' OR auth.uid()::text = "companyId");

-- Seule l'entreprise propriétaire peut créer, modifier ou supprimer ses services
CREATE POLICY "Companies can insert own services" ON "services"
    FOR INSERT WITH CHECK (auth.uid()::text = "companyId");

CREATE POLICY "Companies can update own services" ON "services"
    FOR UPDATE USING (auth.uid()::text = "companyId") WITH CHECK (auth.uid()::text = "companyId");

CREATE POLICY "Companies can delete own services" ON "services"
    FOR DELETE USING (auth.uid()::text = "companyId");

-- 4. SUBSCRIPTIONS
-- L'utilisateur voit ses abonnements, l'entreprise peut compter les abonnés de ses services
CREATE POLICY "Subscriptions viewable by subscriber or service owner" ON "subscriptions"
    FOR SELECT USING (
        auth.uid()::text = "userId" 
        OR EXISTS (
            SELECT 1 FROM "services" s 
            WHERE s.id = "subscriptions"."serviceId" AND s."companyId" = auth.uid()::text
        )
    );

-- L'utilisateur ne peut gérer QUE ses propres abonnements
CREATE POLICY "Users can insert own subscriptions" ON "subscriptions"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own subscriptions" ON "subscriptions"
    FOR DELETE USING (auth.uid()::text = "userId");

-- 5. UPDATE_ANNOUNCEMENTS
-- Lecture publique des annonces
CREATE POLICY "Announcements viewable by everyone" ON "update_announcements"
    FOR SELECT USING (true);

-- Seule l'entreprise propriétaire du service peut publier/modifier/supprimer des annonces
CREATE POLICY "Companies can insert announcements for own services" ON "update_announcements"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "services" s 
            WHERE s.id = "update_announcements"."serviceId" AND s."companyId" = auth.uid()::text
        )
    );

CREATE POLICY "Companies can update announcements for own services" ON "update_announcements"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "services" s 
            WHERE s.id = "update_announcements"."serviceId" AND s."companyId" = auth.uid()::text
        )
    );

CREATE POLICY "Companies can delete announcements for own services" ON "update_announcements"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "services" s 
            WHERE s.id = "update_announcements"."serviceId" AND s."companyId" = auth.uid()::text
        )
    );

-- 6. FEEDBACKS
-- Lecture : feedbacks validés lisibles par tous, les feedbacks en attente lisibles uniquement par l'auteur et l'entreprise
CREATE POLICY "Feedbacks viewable if approved or owner" ON "feedbacks"
    FOR SELECT USING (
        "moderationStatus" = 'APPROVED'
        OR EXISTS (
            SELECT 1 FROM "subscriptions" sub
            JOIN "services" s ON s.id = sub."serviceId"
            WHERE sub.id = "feedbacks"."subscriptionId" 
            AND (sub."userId" = auth.uid()::text OR s."companyId" = auth.uid()::text)
        )
    );

-- Seul un abonné authentifié au service peut déposer un feedback (avec moderationStatus initial = PENDING)
CREATE POLICY "Subscribers can insert feedback" ON "feedbacks"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "subscriptions" sub
            WHERE sub.id = "feedbacks"."subscriptionId" AND sub."userId" = auth.uid()::text
        )
    );
