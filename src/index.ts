import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Auto-setup public API permissions on first run
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        strapi.log.warn('[bootstrap] Public role not found, skipping permission setup');
        return;
      }

      const permissions = [
        // Product: public read
        { action: 'api::product.product.find', role: publicRole.id },
        { action: 'api::product.product.findOne', role: publicRole.id },
        // News: public read
        { action: 'api::news.news.find', role: publicRole.id },
        { action: 'api::news.news.findOne', role: publicRole.id },
        // FAQ: public read
        { action: 'api::faq.faq.find', role: publicRole.id },
        { action: 'api::faq.faq.findOne', role: publicRole.id },
        // Knowledge Base: public read (for Lvjia AI chatbot)
        { action: 'api::knowledge-base.knowledge-base.find', role: publicRole.id },
        { action: 'api::knowledge-base.knowledge-base.findOne', role: publicRole.id },
        // Inquiry: public create (website visitors submit inquiries)
        { action: 'api::inquiry.inquiry.create', role: publicRole.id },
      ];

      let created = 0;
      for (const perm of permissions) {
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: perm });

        if (!existing) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: perm,
          });
          created++;
        }
      }

      if (created > 0) {
        strapi.log.info(`[bootstrap] Set up ${created} public API permissions`);
      }
    } catch (e) {
      strapi.log.warn('[bootstrap] Permission setup skipped:', (e as Error).message);
    }
  },
};
