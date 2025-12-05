export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const shop = req.headers['x-shopify-shop'];
  const token = req.headers['x-shopify-token'];
  
  if (!shop || !token) {
      return res.status(401).json({ error: 'Unauthorized: Missing Shop or Token headers' });
  }

  const { title, handle, items } = req.body;

  // Recursive formatter with Depth Check
  const formatItems = (itemList, depth = 1) => {
      if (depth > 3) {
          throw new Error("Menu is too deep! Shopify only allows 3 levels of nesting.");
      }

      return itemList.map(item => {
          const formatted = {
              title: item.title,
              type: item.type,
              url: item.url
          };
          if (item.resourceId) formatted.resourceId = item.resourceId;
          if (item.items && item.items.length > 0) {
              formatted.items = formatItems(item.items, depth + 1);
          }
          return formatted;
      });
  };

  const mutation = `
  mutation CreateMenu($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id handle }
      userErrors { field message }
    }
  }
  `;

  try {
      // Validate and Format
      let formattedItems;
      try {
          formattedItems = formatItems(items);
      } catch (validationError) {
          return res.status(400).json({ userErrors: [{ field: ["items"], message: validationError.message }] });
      }

      const variables = {
          title,
          handle,
          items: formattedItems
      };

      const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
              'X-Shopify-Access-Token': token,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: mutation, variables })
      });

      const result = await response.json();
      res.json(result.data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
}