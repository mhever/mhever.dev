import { ExperienceRole } from './types'

export const profile = {
  name: 'Marton Hever',
  title: 'Platform Engineer',
  location: 'Halifax, NS, Canada',
  status: 'Permanent Resident',
  availability: 'Remote / Local',
  linkedin: 'https://www.linkedin.com/in/marton-hever/',
  email: 'marton.hever@gmail.com',
  summary:
    'Platform Engineer with 7+ years in regulated Azure environments. ' +
    'Specializing in Go automation, Terraform IaC, and enterprise CI/CD ' +
    'at 2,000+-engineer scale. Recently expanded expertise into Kubernetes ' +
    'and cloud-native patterns.',
}

export const technologies = {
  primary: [
    'Azure', 'Azure DevOps', 'Go', 'Terraform', 'Docker', 'IaC', 'Linux',
    'CI/CD', 'Packer', 'Bash',
  ],
  secondary: [
    'Kubernetes', 'DevSecOps', 'Azure Networking', 'Camunda Zeebe',
    'Java', 'TypeScript',
  ],
  observability: [
    'Prometheus', 'Grafana', 'ELK Stack',
  ],
}

export const certifications = [
  { name: 'HashiCorp Terraform Associate', date: 'Jan 2026' },
  { name: 'AZ-104 Azure Administrator', date: 'Feb 2025' },
  { name: 'AZ-500 Azure Security Engineer', date: 'Jan 2025' },
  { name: 'AZ-700 Azure Network Engineer', date: 'Dec 2024' },
]

export const skills = {
  strong: [
    'Azure Cloud Platform (7+ years)',
    'Azure DevOps CI/CD (SME)',
    'Go - production systems',
    'Terraform IaC',
    'Enterprise platform operations',
    'Tier-3 escalation engineering',
    'Docker containerization',
    'Linux administration',
    'Regulated environment compliance',
  ],
  moderate: [
    'Kubernetes (k3s home lab)',
    'Azure Networking (AZ-700)',
    'Azure Security (AZ-500)',
    'Camunda Zeebe orchestration',
    'Prometheus / Grafana',
    'Java / Spring (legacy)',
    'TypeScript',
  ],
  gaps: [],
}

export const experience: ExperienceRole[] = [
  {
    title: 'Senior Platform Engineer',
    company: 'Swiss Re (via Cognizant Canada)',
    period: '03/2022 – 12/2025',
    items: [
      {
        label: 'Automated Infrastructure',
        title: 'Custom Azure DevOps Agent Pools',
        description:
          'Core engineer building custom Azure DevOps agent pools ' +
          '(Terraform, Packer, Azure VMSS) providing consistent mission-critical ' +
          'build environments for 2,000+ developers. Expanded responsibilities ' +
          'after architect departure.',
        context:
          'This was a multi-year project involving ~6 Linux pools and 3 Windows pools ' +
          'across multiple Azure regions, all managed by the same Terraform codebase ' +
          'with region-specific configurations. I worked alongside two solution architects ' +
          'who designed the initial system. When one architect left at the end of 2024, ' +
          'I stepped up as the primary SME. The real challenge was maintaining consistency ' +
          'across all pools while serving different team requirements — some pools needed ' +
          'specific SDKs, others needed particular network access patterns. Every change ' +
          'had to be carefully validated because a broken build agent means 2,000 developers ' +
          'are blocked.',
        tags: ['Terraform', 'Packer', 'Azure VMSS', 'IaC'],
      },
      {
        label: 'Tier-3 Engineering Support',
        title: 'Cross-Platform Escalation',
        description:
          'Acted as escalation point during critical releases, diagnosing ' +
          'and fixing complex network, security, and pipeline failures across ' +
          'hybrid legacy and cloud-native platforms.',
        context:
          'In an enterprise shop with this many developers, production issues span ' +
          'everything from Azure networking to legacy mainframe connectivity. My role ' +
          'was deep troubleshooting when standard support couldn\'t resolve issues. ' +
          'This meant understanding the full stack — from how Azure DevOps pipelines ' +
          'trigger builds, through the agent pool infrastructure I maintained, down to ' +
          'the deployment targets which included mainframes and specialized legacy systems. ' +
          'The key skill here isn\'t knowing everything — it\'s knowing how to narrow down ' +
          'where the failure is happening across a complex chain of systems.',
        tags: ['Troubleshooting', 'Networking', 'Security'],
      },
      {
        label: 'Full-Stack Deployment Bridge',
        title: 'Go API Gateway + ADO Extension',
        description:
          'Engineered a TypeScript ADO extension and Go API gateway connecting ' +
          'Azure DevOps to legacy targets (Mainframes, PowerCenter) for 100+ developers, ' +
          'featuring real-time HTTP/2 log streaming to eliminate \'black box\' deployments.',
        context:
          'I owned this system for 5 years. The core problem: developers using Azure DevOps ' +
          'needed to deploy to legacy platforms (IBM mainframes, PowerCenter) but there was ' +
          'no native integration. Previously, a large Java monolith handled this, but it was ' +
          'being retired. I built a Go gateway from scratch that acted as the bridge. ' +
          'The HTTP/2 streaming was critical — before my solution, deployments to legacy ' +
          'targets were a black box where developers would trigger a deploy and just wait. ' +
          'With streaming, they could watch real-time progress in the Azure DevOps UI. ' +
          'The system processed 50-100 requests/day at peak, declining to 30-40/day as ' +
          'legacy platforms were themselves retired. This natural decline was actually a ' +
          'success metric — it meant modernization was working.',
        tags: ['Go', 'TypeScript', 'HTTP/2', 'Azure DevOps'],
      },
      {
        label: 'Stack Modernization',
        title: 'Database & Orchestration Migration',
        description:
          'Replaced deprecated DB2 with read-only SQLite to cut dependency bloat, ' +
          'and migrated orchestration from IBM BPM to Camunda Zeebe.',
        context:
          'The DB2 migration was a pragmatic decision. The Go gateway originally used DB2 ' +
          'because that\'s what the Java monolith it replaced had used. But maintaining a ' +
          'DB2 dependency for what was essentially a read-only lookup table was overkill. ' +
          'I evaluated Oracle (the Go driver ecosystem was immature — single-developer ' +
          'projects wrapping stolen C bindings) and went with SQLite. Clean, zero-dependency, ' +
          'perfect for the read-only use case. The IBM BPM to Camunda Zeebe migration ' +
          'was similar thinking — replace a heavyweight legacy orchestrator with something ' +
          'modern and maintainable. Both changes reduced the operational surface area of the ' +
          'system significantly.',
        tags: ['Go', 'SQLite', 'Camunda Zeebe', 'Migration'],
      },
    ],
  },
  {
    title: 'Platform Engineer',
    company: 'Swiss Re (via Cognizant Hungary)',
    period: '07/2018 – 03/2022',
    items: [
      {
        label: 'Go Platform Tooling',
        title: 'Deployment Gateway (Architect)',
        description:
          'Engineered a Dockerized Go deployment gateway from scratch to replace ' +
          'a legacy Java monolith. Architected a custom worker pool with strict ' +
          'per-platform concurrency limits, enforced API-level authentication, ' +
          'and integrated Bamboo, IBM BPM, and DB2  to automate deployments to legacy ' +
          'target platforms.',
        context:
          'I started learning Go in 2019 specifically to build this. The existing Java ' +
          'monolith was enormous, hard to maintain, and being retired. Rather than rebuild ' +
          'it in Java, I proposed a lightweight Go service. The worker pool design was ' +
          'critical — different deployment targets had different concurrency constraints. ' +
          'A mainframe might handle 2 concurrent deploys, while another target could handle ' +
          '10. The pool enforced these limits at the API level so developers couldn\'t ' +
          'accidentally overwhelm legacy systems. The authentication was enforced per-request ' +
          'to prevent unauthorized deployments in a regulated financial environment.',
        tags: ['Go', 'Docker', 'Architecture'],
      },
      {
        label: 'Toolchain Extension',
        title: 'Bamboo Plugin Maintenance',
        description:
          'Primary maintainer of custom Atlassian Bamboo plugin suite (Java/Spring). ' +
          'Extended functionality, implemented fixes, served as Tier-3 escalation.',
        context:
          'These were custom plugins that enforced governance and compliance for the CI/CD ' +
          'platform — things like deployment target restrictions, approval workflows, and ' +
          'artifact management. I didn\'t create them originally but became the primary ' +
          'maintainer. The hardest part was working with Bamboo\'s internals — it stored ' +
          'configuration in an Oracle database using a bizarre XML-in-table structure. ' +
          'Debugging production issues meant reverse-engineering these XML constructs. ' +
          'I also created a new plugin to integrate my Go gateway with Bamboo, bridging ' +
          'the old CI/CD platform with the new deployment system.',
        tags: ['Java', 'Spring', 'Atlassian Bamboo'],
      },
      {
        label: 'Production Stability',
        title: 'Build Agent Reliability',
        description:
          'Co-implemented ActiveMQ tuning and custom Java extensions to resolve ' +
          'vendor defects affecting Bamboo build agent reliability. Escalation ' +
          'engineer for Bamboo agents.',
        context:
          'Bamboo agents communicated with the server via ActiveMQ, and under load, ' +
          'agents would sometimes silently disconnect or pick up stale build configurations. ' +
          'The fix involved tuning ActiveMQ parameters and writing custom Java extensions ' +
          'that worked around vendor bugs we\'d identified. In one case, I wrote a ' +
          '-javaagent instrumentation that hot-patched a critical initialization bug in ' +
          'the Bamboo agent runtime, preventing faulty agents from corrupting build state. ' +
          'This kind of vendor-internal debugging was a recurring theme — when you\'re ' +
          'responsible for build infrastructure serving thousands of developers, you need ' +
          'to understand the tools deeper than the vendor documentation covers.',
        tags: ['Java', 'ActiveMQ', 'JVM', 'Debugging'],
      },
    ],
  },
  {
    title: 'Java Developer',
    company: 'Szakálfém Kft / Hungary',
    period: '09/2005 – 07/2018',
    items: [
      {
        label: 'Full-Stack ERP System',
        title: 'Custom Business Platform',
        description:
          'Built and maintained custom ERP system (Java, MySQL) with full-stack ' +
          'ownership from development through production operations. Small team ' +
          'environment provided the foundation for later platform engineering work.',
        context:
          'This was a team of 5 people building a complete business system from scratch — ' +
          'inventory management, invoicing, webshop, government tax integration, everything. ' +
          'I handled coding plus light operations and automation while a colleague handled ' +
          'coding plus MySQL administration.',
        tags: ['Java', 'MySQL', 'ERP'],
      },
    ],
  },
]

export const homelab = {
  title: 'Kubernetes GitOps Pipeline',
  label: 'Home Lab',
  description:
    'Built and operated a k3s-based GitOps deployment pipeline ' +
    '(GitHub Actions → GitHub Container Registry → FluxCD/Kustomize) ' +
    'deploying a containerized Go application with immutable image tags, ' +
    'automated rollouts, and real incident resolution.',
  context:
    'I started this in January 2026 specifically to close my Kubernetes knowledge gap. ' +
    'The setup runs on a ThinkCentre M715q (Ryzen 2400GE, 16GB RAM) running k3s. ' +
    'I\'ve worked through real operational issues — disk pressure taints when the node ' +
    'ran low on storage, SHA mismatch problems with image reconciliation, and FluxCD ' +
    'configuration challenges. It\'s not production experience, and I\'m upfront about that. ' +
    'But it gives me hands-on understanding of the deployment model, the troubleshooting ' +
    'patterns, and the GitOps workflow. My next steps are adding RBAC, Ingress controllers, ' +
    'Prometheus/Grafana monitoring, and Helm charts.',
  tags: ['Kubernetes', 'k3s', 'FluxCD', 'Kustomize', 'GitHub Actions'],
}

export const education = [
  { degree: 'MSc, Computer Science Engineering', school: 'Széchényi István University, Hungary', year: '2013' },
  { degree: 'BSc, Computer Science Engineering', school: 'Pannon University, Hungary', year: '2011' },
]

export const languages = [
  { language: 'English', level: 'Professional' },
  { language: 'French', level: 'Conversational' },
  { language: 'Hungarian', level: 'Native' },
]

export const chatSuggestions = [
  'What kind of production systems have you built?',
  'Tell me about your Go experience',
  'How do you handle Kubernetes gaps?',
  'What was your role at Swiss Re?',
  'Describe a difficult technical decision',
]