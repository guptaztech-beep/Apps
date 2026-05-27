import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // Gemini API Route
  app.post("/api/generate-tags", async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 5-8 relevant hashtags for this blog post title: "${title}" and content preview: "${content?.substring(0, 500)}". Return ONLY the hashtags, space separated, starting with #.`,
      });
      
      const text = response.text || "";
      const tags = text.split(/\s+/).filter(t => t.startsWith('#'));
      
      res.json({ tags: [...new Set(tags)] });
    } catch (error: any) {
      console.error("Tag generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate tags" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Define sitemap dynamically for Google Search Console indexing
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
      let projectId = "gen-lang-client-0294842239";
      let databaseId = "(default)";
      
      if (fs.existsSync(configPath)) {
        try {
          const configObj = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          projectId = configObj.projectId || projectId;
          databaseId = configObj.firestoreDatabaseId || databaseId;
        } catch (e) {
          console.error("Failed to parse firebase configuration for sitemap:", e);
        }
      }

      const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host') || 'ais-pre-nvbc3pcyvnblr6z3lt6qn7-7884261732.asia-southeast1.run.app';
      const origin = `${proto}://${host}`;

      let blogsList: any[] = [];
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/blogs?pageSize=100`;
        const firestoreRes = await fetch(firestoreUrl);
        if (firestoreRes.ok) {
          const data = await firestoreRes.json();
          if (data.documents && data.documents.length > 0) {
            blogsList = data.documents.map((d: any) => {
              const fields = d.fields || {};
              return {
                slug: fields.slug?.stringValue || "",
                date: fields.date?.stringValue || "",
                category: fields.category?.stringValue || ""
              };
            }).filter((b: any) => b.slug);
          }
        }
      } catch (err) {
        console.error("Sitemap: Failed to query firestore for dynamic links, using fallback constants", err);
      }

      if (blogsList.length === 0) {
        blogsList = [
          { slug: 'neet-ug-2026-paper-leak-reneet-update', category: 'NEET' },
          { slug: 'cbse-class-12-result-2026-live-link', category: 'Result' },
          { slug: 'cuet-ug-2026-analysis-cutoffs', category: 'Exam' }
        ];
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Core general routes
      const staticPaths = ["", "/careers", "/privacy", "/editorial-policy", "/sitemap", "/category/CBSE", "/category/Result", "/category/NEET", "/category/How-To", "/category/Exam"];
      for (const p of staticPaths) {
        xml += `  <url>\n`;
        xml += `    <loc>${origin}${p}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      // Dynamic generated blog routes
      for (const blog of blogsList) {
        xml += `  <url>\n`;
        xml += `    <loc>${origin}/blog/${blog.slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.status(200).send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Determine production mode reliably
  const isProd = process.env.NODE_ENV === "production" || (!process.argv.slice(1).some(arg => arg.endsWith('server.ts')) && fs.existsSync(path.resolve(process.cwd(), 'dist/index.html')));

  // Vite middleware for development vs static serve for production
  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Dynamic SEO HTML Injection for single blog posts
    app.get('/blog/:slug', async (req, res) => {
      const slug = req.params.slug;
      const indexPath = path.resolve(distPath, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        return res.status(500).send('Project build in progress or dist/index.html is missing.');
      }

      let htmlContents = fs.readFileSync(indexPath, 'utf-8');

      // Fetch config coordinates for Firestore HTTP query
      const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
      let projectId = "gen-lang-client-0294842239";
      let databaseId = "(default)";
      if (fs.existsSync(configPath)) {
        try {
          const configObj = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          projectId = configObj.projectId || projectId;
          databaseId = configObj.firestoreDatabaseId || databaseId;
        } catch (e) {
          // ignore
        }
      }

      // Query single document by slug using standard runQuery on Google API
      let blogPost: any = null;
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:runQuery`;
        const response = await fetch(firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: 'blogs' }],
              where: {
                fieldFilter: {
                  field: { fieldPath: 'slug' },
                  op: 'EQUAL',
                  value: { stringValue: slug }
                }
              },
              limit: 1
            }
          })
        });

        if (response.ok) {
          const results = await response.json();
          if (results && results.length > 0 && results[0].document) {
            const rawDoc = results[0].document;
            const fields = rawDoc.fields || {};
            blogPost = {
              title: fields.title?.stringValue || "",
              excerpt: fields.excerpt?.stringValue || "",
              imageUrl: fields.imageUrl?.stringValue || ""
            };
          }
        }
      } catch (err) {
        console.error("Dynamic SEO metadata fetch failed:", err);
      }

      // If this blog slug exists online, overwrite standard titles/meta
      if (blogPost) {
        const titleText = `${blogPost.title} | RollFetch Journal`;
        const descText = blogPost.excerpt || "Official Exams and Results Daily Board Update";
        
        // Inject dynamic tags elegantly
        htmlContents = htmlContents.replace(
          /<title>.*?<\/title>/,
          `<title>${titleText}</title>\n    <meta name="description" content="${descText}" />\n    <meta property="og:title" content="${titleText}" />\n    <meta property="og:description" content="${descText}" />\n    <meta property="og:image" content="${blogPost.imageUrl || ''}" />\n    <meta property="og:type" content="article" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="robots" content="index, follow" />`
        );
      } else {
        htmlContents = htmlContents.replace(
          /<title>.*?<\/title>/,
          `<title>RollFetch | Exams & Results Daily</title>\n    <meta name="description" content="Access exams, board notifications, CUET updates, and results instantly on RollFetch Journal." />\n    <meta name="robots" content="index, follow" />`
        );
      }

      res.status(200).set({ "Content-Type": "text/html" }).send(htmlContents);
    });

    // SPA fallback
    app.get('*', (req, res) => {
      // Exclude API and physical files (that would have extension)
      if (req.path.startsWith('/api') || req.path.includes('.')) {
        return res.status(404).end();
      }
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let htmlContents = fs.readFileSync(indexPath, 'utf-8');
        // Let's ensure default meta tags for SEO are injected
        if (!htmlContents.includes('name="description"')) {
          htmlContents = htmlContents.replace(
            /<title>.*?<\/title>/,
            `<title>RollFetch | Exams & Results Daily</title>\n    <meta name="description" content="RollFetch is an official news and journal resource for board exams, result notifications, CUET admissions, and educational dispatches." />\n    <meta name="robots" content="index, follow" />`
          );
        }
        res.status(200).set({ "Content-Type": "text/html" }).send(htmlContents);
      } else {
        res.status(500).send('Project is still building or dist/index.html is missing.');
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Development SPA Fallback
    app.get('*', async (req, res, next) => {
      // Exclude API and physical files (that would have extension)
      if (req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
