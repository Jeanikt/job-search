/*
  # Criação das tabelas iniciais

  1. Novas Tabelas
    - `users`
      - `id` (uuid, chave primária)
      - `email` (text, único)
      - `is_premium` (boolean)
      - `premium_until` (timestamptz, nullable)
      - `searches_count` (integer)
      - `last_search_date` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `searches`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência a users.id)
      - `location` (text)
      - `country` (text)
      - `job_type` (text)
      - `created_at` (timestamptz)
    - `jobs`
      - `id` (uuid, chave primária)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `country` (text)
      - `description` (text)
      - `url` (text)
      - `posted_at` (timestamptz)
      - `created_at` (timestamptz)
  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Adicionar políticas para usuários autenticados
  3. Funções
    - Função `increment` para incrementar valores
*/

-- Criar extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para incrementar valores
CREATE OR REPLACE FUNCTION increment(x integer)
RETURNS integer AS $$
  BEGIN
    RETURN x + 1;
  END;
$$ LANGUAGE plpgsql;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,
  searches_count INTEGER DEFAULT 0,
  last_search_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de buscas
CREATE TABLE IF NOT EXISTS searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  job_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de vagas
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela de usuários
CREATE POLICY "Usuários podem ler seus próprios dados"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para tabela de buscas
CREATE POLICY "Usuários podem ler suas próprias buscas"
  ON searches
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias buscas"
  ON searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela de vagas
CREATE POLICY "Qualquer pessoa pode ler vagas"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();