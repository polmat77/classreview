
-- Table chatbot_knowledge
CREATE TABLE public.chatbot_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool TEXT NOT NULL CHECK (tool IN ('ClassCouncilAI', 'ReportCardAI', 'QuizMaster', 'global')),
  category TEXT NOT NULL CHECK (category IN ('navigation_pronote', 'utilisation_outil', 'rgpd', 'bug_technique', 'general')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches rapides
CREATE INDEX idx_chatbot_knowledge_tool ON public.chatbot_knowledge(tool);
CREATE INDEX idx_chatbot_knowledge_active ON public.chatbot_knowledge(active);
CREATE INDEX idx_chatbot_knowledge_keywords ON public.chatbot_knowledge USING GIN(keywords);

-- RLS
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique chatbot_knowledge"
  ON public.chatbot_knowledge FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage chatbot_knowledge"
  ON public.chatbot_knowledge FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER update_chatbot_knowledge_updated_at
  BEFORE UPDATE ON public.chatbot_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
