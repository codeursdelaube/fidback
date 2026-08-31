-- =========================================================================
-- PRISMA SCHEMA MIGRATION: init_fidback_tables
-- Target: Supabase PostgreSQL (Public Schema)
-- =========================================================================

-- 1. Table: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 2. Table: Company
CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- 3. Table: Service
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- 4. Table: Subscription
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- 5. Table: Feedback
CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "moderationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "constructiveScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- 6. Table: UpdateAnnouncement
CREATE TABLE IF NOT EXISTS "UpdateAnnouncement" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateAnnouncement_pkey" PRIMARY KEY ("id")
);

-- Indexes & Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "User_pseudo_key" ON "User"("pseudo");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Company_email_key" ON "Company"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_serviceId_key" ON "Subscription"("userId", "serviceId");

-- Foreign Keys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Service_companyId_fkey') THEN
        ALTER TABLE "Service" ADD CONSTRAINT "Service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_userId_fkey') THEN
        ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_serviceId_fkey') THEN
        ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Feedback_subscriptionId_fkey') THEN
        ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UpdateAnnouncement_serviceId_fkey') THEN
        ALTER TABLE "UpdateAnnouncement" ADD CONSTRAINT "UpdateAnnouncement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- =========================================================================
-- SECURE ROW LEVEL SECURITY (RLS) POLICIES USING auth.uid()
-- =========================================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UpdateAnnouncement" ENABLE ROW LEVEL SECURITY;

-- 1. USER
DROP POLICY IF EXISTS "Users can read own profile" ON "User";
CREATE POLICY "Users can read own profile" ON "User" FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile" ON "User";
CREATE POLICY "Users can update own profile" ON "User" FOR UPDATE USING (auth.uid()::text = id);

-- 2. COMPANY
DROP POLICY IF EXISTS "Public can view companies" ON "Company";
CREATE POLICY "Public can view companies" ON "Company" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can manage own record" ON "Company";
CREATE POLICY "Companies can manage own record" ON "Company" FOR ALL USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

-- 3. SERVICE
DROP POLICY IF EXISTS "Public read services" ON "Service";
CREATE POLICY "Public read services" ON "Service" FOR SELECT USING ("visibility" = 'PUBLIC' OR auth.uid()::text = "companyId");

DROP POLICY IF EXISTS "Companies insert own services" ON "Service";
CREATE POLICY "Companies insert own services" ON "Service" FOR INSERT WITH CHECK (auth.uid()::text = "companyId");

DROP POLICY IF EXISTS "Companies update own services" ON "Service";
CREATE POLICY "Companies update own services" ON "Service" FOR UPDATE USING (auth.uid()::text = "companyId") WITH CHECK (auth.uid()::text = "companyId");

DROP POLICY IF EXISTS "Companies delete own services" ON "Service";
CREATE POLICY "Companies delete own services" ON "Service" FOR DELETE USING (auth.uid()::text = "companyId");

-- 4. SUBSCRIPTION
DROP POLICY IF EXISTS "Subscriptions viewable by subscriber or service owner" ON "Subscription";
CREATE POLICY "Subscriptions viewable by subscriber or service owner" ON "Subscription" FOR SELECT USING (
    auth.uid()::text = "userId"
    OR EXISTS (
        SELECT 1 FROM "Service" s WHERE s.id = "Subscription"."serviceId" AND s."companyId" = auth.uid()::text
    )
);

DROP POLICY IF EXISTS "Users insert own subscriptions" ON "Subscription";
CREATE POLICY "Users insert own subscriptions" ON "Subscription" FOR INSERT WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Users delete own subscriptions" ON "Subscription";
CREATE POLICY "Users delete own subscriptions" ON "Subscription" FOR DELETE USING (auth.uid()::text = "userId");

-- 5. UPDATE_ANNOUNCEMENT
DROP POLICY IF EXISTS "Announcements viewable by everyone" ON "UpdateAnnouncement";
CREATE POLICY "Announcements viewable by everyone" ON "UpdateAnnouncement" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies insert announcements for own services" ON "UpdateAnnouncement";
CREATE POLICY "Companies insert announcements for own services" ON "UpdateAnnouncement" FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Service" s WHERE s.id = "UpdateAnnouncement"."serviceId" AND s."companyId" = auth.uid()::text
    )
);

DROP POLICY IF EXISTS "Companies update announcements for own services" ON "UpdateAnnouncement";
CREATE POLICY "Companies update announcements for own services" ON "UpdateAnnouncement" FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM "Service" s WHERE s.id = "UpdateAnnouncement"."serviceId" AND s."companyId" = auth.uid()::text
    )
);

DROP POLICY IF EXISTS "Companies delete announcements for own services" ON "UpdateAnnouncement";
CREATE POLICY "Companies delete announcements for own services" ON "UpdateAnnouncement" FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM "Service" s WHERE s.id = "UpdateAnnouncement"."serviceId" AND s."companyId" = auth.uid()::text
    )
);

-- 6. FEEDBACK
DROP POLICY IF EXISTS "Feedbacks viewable if approved or owner" ON "Feedback";
CREATE POLICY "Feedbacks viewable if approved or owner" ON "Feedback" FOR SELECT USING (
    "moderationStatus" = 'APPROVED'
    OR EXISTS (
        SELECT 1 FROM "Subscription" sub
        JOIN "Service" s ON s.id = sub."serviceId"
        WHERE sub.id = "Feedback"."subscriptionId" 
        AND (sub."userId" = auth.uid()::text OR s."companyId" = auth.uid()::text)
    )
);

DROP POLICY IF EXISTS "Subscribers insert feedback" ON "Feedback";
CREATE POLICY "Subscribers insert feedback" ON "Feedback" FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Subscription" sub
        WHERE sub.id = "Feedback"."subscriptionId" AND sub."userId" = auth.uid()::text
    )
);
