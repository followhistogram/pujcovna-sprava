-- Create a table for email templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'reservation_confirmation', 'shipping_notification'
    subject TEXT,
    body TEXT, -- HTML content
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON email_templates
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Insert a default template for reservation confirmation
INSERT INTO email_templates (name, subject, body)
VALUES (
    'reservation_confirmation',
    'Potvrzení rezervace č. {{short_id}}',
    '<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { width: 90%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
  .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #000; }
  .footer { margin-top: 20px; font-size: 12px; color: #777; }
  ul { padding-left: 20px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">Potvrzení rezervace</div>
    <p>Dobrý den {{customer_name}},</p>
    <p>děkujeme za Vaši rezervaci č. <strong>{{short_id}}</strong>. Níže naleznete její shrnutí:</p>
    
    <h3>Detaily rezervace:</h3>
    <ul>
      <li><strong>Termín od:</strong> {{rental_start_date}}</li>
      <li><strong>Termín do:</strong> {{rental_end_date}}</li>
      <li><strong>Celková cena:</strong> {{total_price}} Kč</li>
    </ul>

    <h3>Položky:</h3>
    <ul>
      {{items_list}}
    </ul>

    <p>Brzy se Vám ozveme s dalšími informacemi.</p>
    <p>S pozdravem,<br>Tým Půjčovny Polaroidů</p>
    <div class="footer">
      <p>Toto je automaticky generovaný e-mail. Prosím, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>'
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust for admin roles in production)
CREATE POLICY "Allow full access to email templates" ON email_templates FOR ALL USING (true);
