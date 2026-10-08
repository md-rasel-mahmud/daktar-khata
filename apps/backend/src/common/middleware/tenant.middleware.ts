import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { collectionsName } from "../../constant";
import { MerchantDocument } from "../../modules/merchant/schema/merchant.schema";

declare global {
  namespace Express {
    interface Request {
      tenant?: MerchantDocument | null;
      tenantId?: any;
      tenantNotFound?: boolean;
      tenantDomain?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    @InjectModel(collectionsName.merchant)
    private readonly merchantModel: Model<MerchantDocument>
  ) {}

  private extractDomainCandidate(req: Request): string | null {
    // 1. Explicit tenant header (highest priority, sent by frontend API client)
    const headerDomain =
      (req.headers["x-tenant-domain"] as string) ||
      (req.headers["x-tenant-subdomain"] as string);

    if (headerDomain && typeof headerDomain === "string") {
      const clean = headerDomain.trim().toLowerCase().split(":")[0];
      if (clean && clean !== "localhost" && clean !== "null" && clean !== "undefined") {
        return clean;
      }
    }

    // 2. Check Origin or Referer header
    const origin = req.headers["origin"] || req.headers["referer"];
    if (origin && typeof origin === "string") {
      try {
        const url = new URL(origin);
        const host = url.hostname.toLowerCase();
        const candidate = this.extractSubdomainFromHost(host);
        if (candidate) return candidate;
      } catch {
        // invalid URL format, ignore
      }
    }

    // 3. Check incoming Host header
    const hostHeader = req.headers["host"] || req.hostname;
    if (hostHeader && typeof hostHeader === "string") {
      const host = hostHeader.toLowerCase().split(":")[0];
      const candidate = this.extractSubdomainFromHost(host);
      if (candidate) return candidate;
    }

    return null;
  }

  private extractSubdomainFromHost(host: string): string | null {
    if (!host) return null;
    const cleanHost = host.split(":")[0].trim().toLowerCase();

    // Check localhost subdomains like "apollo.localhost"
    if (cleanHost.endsWith(".localhost")) {
      const parts = cleanHost.split(".");
      if (parts.length > 1 && parts[0] !== "www") {
        return parts[0];
      }
    }

    // Ignore naked localhost, IPs
    if (
      cleanHost === "localhost" ||
      cleanHost === "127.0.0.1" ||
      cleanHost === "0.0.0.0"
    ) {
      return null;
    }

    // Check platform domains like admin.daktarkhata.com, daktarkhata.com, app.daktarkhata.com
    const platformDomains = ["daktarkhata.com", "daktarkhata.org", "daktar-khata.local"];
    for (const base of platformDomains) {
      if (cleanHost === base || cleanHost === `www.${base}` || cleanHost === `admin.${base}`) {
        return null;
      }
      if (cleanHost.endsWith(`.${base}`)) {
        const sub = cleanHost.replace(`.${base}`, "");
        if (sub && sub !== "www" && sub !== "api" && sub !== "admin") {
          return sub;
        }
      }
    }

    // If host has at least two dots (subdomain.domain.com), extract first part
    const parts = cleanHost.split(".");
    if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "api") {
      return parts[0];
    }

    // Full custom domain check (e.g. "apollo-clinic.com")
    if (parts.length >= 2) {
      return cleanHost;
    }

    return null;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = this.extractDomainCandidate(req);

      if (!candidate) {
        req.tenant = null;
        req.tenantId = null;
        return next();
      }

      req.tenantDomain = candidate;

      // Look up merchant by subdomain, domain, or customDomain
      const merchant = await this.merchantModel.findOne({
        $or: [
          { subdomain: candidate },
          { domain: candidate },
          { customDomain: candidate },
          { "subdomain": candidate.toLowerCase() },
        ],
      });

      if (merchant) {
        req.tenant = merchant;
        req.tenantId = merchant._id;
      } else {
        req.tenant = null;
        req.tenantId = null;
        req.tenantNotFound = true;
      }
    } catch (err: any) {
      this.logger.error("Error resolving tenant in TenantMiddleware", err?.message);
      req.tenant = null;
      req.tenantId = null;
    }

    next();
  }
}
