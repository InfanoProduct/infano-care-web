import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Mock data to inject into templates
const mockData = {
  parent_name: "Ananya Sharma",
  order_id: "INF-98271",
  order_date: "June 22, 2026",
  shipping_address: {
    name: "Ananya Sharma",
    full_address: "Apartment 4B, Sunflower Heights, Sector 4, HSR Layout, Bengaluru, Karnataka - 560102"
  },
  payment_method: "UPI (PhonePe)",
  subtotal: "₹999.00",
  discount: "₹100.00",
  total: "₹899.00",
  view_order_url: "#",
  tracking_url: "#",
  explore_url: "#",
  courier_name: "Delhivery",
  tracking_id: "DELHIVERY987654321",
  order_items: [
    {
      title: "Gigi: The Awkward Age Book (Premium Hardcover Guide)",
      quantity: 1,
      price: "₹999.00"
    }
  ]
};

function simpleRender(template: string, data: any): string {
  let result = template;

  // Render {{#each order_items}}...{{/each}}
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  result = result.replace(eachRegex, (match, arrayName, innerTemplate) => {
    const list = data[arrayName];
    if (!Array.isArray(list)) return '';
    return list.map((item: any) => {
      let renderedItem = innerTemplate;
      // replace {{this.title}}, {{this.quantity}}, etc.
      renderedItem = renderedItem.replace(/\{\{this\.(\w+)\}\}/g, (m: string, propName: string) => {
        return item[propName] !== undefined ? String(item[propName]) : '';
      });
      return renderedItem;
    }).join('');
  });

  // Render {{nested.property}} like shipping_address.name
  const nestedRegex = /\{\{(\w+)\.(\w+)\}\}/g;
  result = result.replace(nestedRegex, (match, parentProp, childProp) => {
    return data[parentProp] && data[parentProp][childProp] !== undefined
      ? String(data[parentProp][childProp])
      : '';
  });

  // Render triple curly variables (unescaped HTML): {{{var}}}
  const unescapedVarRegex = /\{\{\{(\w+)\}\}\}/g;
  result = result.replace(unescapedVarRegex, (match, propName) => {
    return data[propName] !== undefined ? String(data[propName]) : '';
  });

  // Render normal variables: {{var}}
  const varRegex = /\{\{(\w+)\}\}/g;
  result = result.replace(varRegex, (match, propName) => {
    return data[propName] !== undefined ? String(data[propName]) : '';
  });

  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const templateName = searchParams.get('template') || 'order-placed';
  const isEnhanced = searchParams.get('enhanced') === 'true';

  try {
    // Resolve the paths relative to the current API project
    const baseDir = path.join(process.cwd(), '..', 'infano-care-api', 'src', 'common', 'templates', 'emails');
    const templatesDir = isEnhanced ? path.join(baseDir, 'enhanced') : baseDir;
    
    // Read the base layout
    const baseSource = await fs.readFile(path.join(templatesDir, 'base.hbs'), 'utf-8');
    
    // Read the specific email template
    const templatePath = path.join(templatesDir, `${templateName}.hbs`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');

    // Compile templates using the custom simple template engine
    const preheaderText = templateName === 'order-placed' 
      ? "Order confirmed. Here's what happens next." 
      : templateName === 'order-shipped' 
      ? 'Track your package in real-time.' 
      : 'Tips to make the most of this wellness journey together.';

    const subject = templateName === 'order-placed'
      ? `Order #${mockData.order_id} - Your Gigi-Book is on its way to making a difference! 🌸`
      : templateName === 'order-shipped'
      ? `Order #${mockData.order_id} - Your Gigi-Book has been shipped! 📦`
      : `Order #${mockData.order_id} - Your Gigi-Book has arrived! Here's how to get started 🌟`;

    const innerHtml = simpleRender(templateSource, {
      ...mockData,
      IMAGE_BASE_URL: 'http://localhost:3000/api/email-assets'
    });
    
    const finalHtml = simpleRender(baseSource, {
      ...mockData,
      IMAGE_BASE_URL: 'http://localhost:3000/api/email-assets',
      subject,
      preheaderText,
      body: innerHtml
    });

    // Return the HTML directly with the appropriate Content-Type header
    return new Response(finalHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err: any) {
    console.error('Error rendering template preview:', err);
    return NextResponse.json({ error: 'Failed to read template files. Make sure path is correct.' }, { status: 500 });
  }
}
