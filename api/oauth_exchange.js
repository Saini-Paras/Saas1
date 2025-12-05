export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { shop, client_id, client_secret, code } = req.body;

  if (!shop || !client_id || !client_secret || !code) {
      return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
      // Clean shop URL
      const shopUrl = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
      
      const response = await fetch(`https://${shopUrl}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              client_id,
              client_secret,
              code
          })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error_description || "Failed to exchange token");
      }
      
      res.json({ access_token: data.access_token });
  } catch (error) {
      console.error('Exchange Error:', error.message);
      res.status(500).json({ 
          error: 'Failed to exchange token', 
          details: error.message 
      });
  }
}