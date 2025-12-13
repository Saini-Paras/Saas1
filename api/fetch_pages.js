export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const shop = req.headers['x-shopify-shop'];
  const token = req.headers['x-shopify-token'];
  
  if (!shop || !token) {
      return res.status(401).json({ error: 'Unauthorized: Missing Shop or Token headers' });
  }

  const query = `
  {
    pages(first: 250) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
  `;

  try {
      const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
              'X-Shopify-Access-Token': token,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
      });

      const result = await response.json();

      if (result.errors) {
          throw new Error(JSON.stringify(result.errors));
      }
      
      const pages = result.data.pages.edges.map(edge => ({
          ...edge.node,
          type: 'PAGE'
      }));
      
      res.json(pages);
  } catch (error) {
      console.error("Fetch Pages Error:", error.message);
      res.status(500).json({ error: error.message });
  }
}