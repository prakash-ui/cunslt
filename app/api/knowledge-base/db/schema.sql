-- Create knowledge base categories table
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES kb_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge base articles table
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES kb_categories(id),
  author_id UUID NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article tags table
CREATE TABLE IF NOT EXISTS kb_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article_tags junction table
CREATE TABLE IF NOT EXISTS kb_article_tags (
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES kb_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create article feedback table
CREATE TABLE IF NOT EXISTS kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  user_id UUID,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expert resources table
CREATE TABLE IF NOT EXISTS expert_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  expert_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default categories
INSERT INTO kb_categories (name, slug, description, icon)
VALUES 
('Getting Started', 'getting-started', 'Learn the basics of using the platform', 'BookOpen'),
('For Experts', 'for-experts', 'Resources and guides for platform experts', 'Briefcase'),
('For Clients', 'for-clients', 'Resources and guides for clients', 'Users'),
('Payments & Billing', 'payments-billing', 'Information about payments, subscriptions and billing', 'CreditCard'),
('Technical Support', 'technical-support', 'Technical help and troubleshooting', 'Wrench');

