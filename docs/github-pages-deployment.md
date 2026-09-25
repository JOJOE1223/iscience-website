# IScience GitHub Pages deployment

## Target and scope

- Canonical source: `F:\Isience Domain`.
- GitHub repository: `https://github.com/JOJOE1223/iscience-website`.
- Publishing branch: `main`; GitHub Actions workflow: `.github/workflows/pages.yml`.
- Default Pages URL: `https://jojoe1223.github.io/iscience-website/`.
- Intended canonical URL: `https://iscience.co.za/`; `www` should redirect to the root.
- User authorized publication of the existing site, custom domain setup and HTTPS on 19 September 2026. No redesign or email DNS changes.
- This workspace was not a Git repository. It now has a local `main` branch and an explicit public-file deployment allowlist.

## DNS instructions for Truehost

Use the existing authoritative DNS zone (currently served by OLiTT nameservers). Do not change nameservers for this deployment.

| Type | Name/host | Value | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | jojoe1223.github.io | 3600 |

The user supplied Truehost's confirmation that the four A records had been set, with `www` initially targeting `versterkriel.github.io`. GitHub returned 404 for that username, while both available authenticated connections identify `JOJOE1223`. **Truehost must correct only the www CNAME to `jojoe1223.github.io`.** The target has no protocol, path or repository suffix.

Do not add a CNAME at `@` because the root also has email records. Preserve MX, SPF, DKIM, DMARC, email aliases, and existing mail-related records. If conflicting website A/AAAA/ALIAS/ANAME records exist at `@`, or conflicting records at `www`, replace only those web records. IPv6 AAAA records are optional; do not leave any old web AAAA record pointing to a different host.

Baseline public DNS before deployment: OLiTT nameservers; MX priority 10 `workplaceproemail.com`, priority 20 `workplaceproemail.net`; SPF `v=spf1 include:_spf.cloudoon.com ~all`; DKIM at `smarthost._domainkey`; DMARC `v=DMARC1; p=quarantine; sp=quarantine; fo=1; adkim=r; aspf=r`. No DNS changes are performed by this publication task.

Official instructions: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) and [GitHub HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Verification and rollout status

Preparation: existing site smoke check passed before publication. Live publishing and custom-domain certificate verification are pending at this preparation checkpoint. Publication is not complete until deployment and live checks are recorded below.

The site's existing Contact page still says `info@iscience.co.za` is pending mailbox activation. This content is deliberately preserved; mailbox activation and contact-content changes are outside this deployment.

## Mutation record and recovery

The Calculator page and its navigation, code, tests, and dedicated styles were removed at the CEO's request. The Pages workflow now validates and packages only the remaining Home, About, Contact, shared assets, and domain files. Email DNS records remain outside this deployment scope.

Rollback after later updates: revert the offending commit and let the same workflow redeploy. For initial-publication rollback, disable Pages in repository Settings > Pages and have Truehost remove/revert only the five web DNS records above, preserving all email records. The original website source remains available locally and in the initial publication commit. Never leave a custom-domain DNS pointer to an unclaimed Pages site.

Next step: publish the verified artifact, correct the www CNAME through Truehost, wait for public DNS and certificate availability, enable HTTPS enforcement, and verify both domain forms.
