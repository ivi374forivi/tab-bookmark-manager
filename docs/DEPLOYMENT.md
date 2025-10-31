# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name (for production)
- SSL certificates (Let's Encrypt recommended)
- Cloud provider account (optional)

## Local Deployment

### Using Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/ivi374forivi/tab-bookmark-manager.git
cd tab-bookmark-manager
```

2. Configure environment variables:
```bash
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env
# Edit .env files with your settings
```

3. Start all services:
```bash
cd infrastructure/docker
docker-compose up -d
```

4. Verify services are running:
```bash
docker-compose ps
```

5. Check logs:
```bash
docker-compose logs -f
```

## Production Deployment

### Option 1: Docker on VPS

1. Set up a VPS (DigitalOcean, AWS EC2, etc.)

2. Install Docker and Docker Compose

3. Clone repository and configure:
```bash
git clone https://github.com/ivi374forivi/tab-bookmark-manager.git
cd tab-bookmark-manager
```

4. Update environment variables for production:
```bash
# backend/.env
NODE_ENV=production
DB_PASSWORD=strong_password
REDIS_PASSWORD=strong_password

# ml-service/.env
DEBUG=False
```

5. Set up SSL with Let's Encrypt:
```bash
# Add nginx configuration for SSL termination
# Use certbot for certificate generation
```

6. Start services:
```bash
cd infrastructure/docker
docker-compose up -d
```

7. Set up automated backups for PostgreSQL:
```bash
# Add cron job for pg_dump
0 2 * * * docker exec postgres pg_dump -U postgres tab_bookmark_manager > /backup/db_$(date +\%Y\%m\%d).sql
```

### Option 2: Kubernetes

1. Create Kubernetes manifests (examples in `infrastructure/kubernetes/`)

2. Set up persistent volumes for:
   - PostgreSQL data
   - Redis data
   - Archive storage

3. Deploy services:
```bash
kubectl apply -f infrastructure/kubernetes/
```

4. Set up ingress for external access

5. Configure monitoring with Prometheus and Grafana

### Option 3: Cloud Services

#### AWS Deployment

1. **Backend API**: Deploy to ECS or Elastic Beanstalk
2. **ML Service**: Deploy to ECS with GPU instances (optional)
3. **Database**: Use RDS for PostgreSQL
4. **Cache**: Use ElastiCache for Redis
5. **Storage**: Use S3 for archived content

#### Google Cloud Platform

1. **Backend API**: Deploy to Cloud Run or GKE
2. **ML Service**: Deploy to Cloud Run with GPUs
3. **Database**: Use Cloud SQL for PostgreSQL
4. **Cache**: Use Memorystore for Redis
5. **Storage**: Use Cloud Storage for archives

## Configuration

### Database Initialization

After first deployment, initialize the database:
```bash
./scripts/migrate-db.sh
```

### ML Models

ML service will download models on first startup. This may take several minutes.

### Browser Extension

1. Build the extension (if needed):
```bash
cd extension
# No build step required for unpacked extension
```

2. Load in browser:
   - Chrome: chrome://extensions/
   - Edge: edge://extensions/
   - Enable Developer Mode
   - Load Unpacked → select extension directory

For production, consider publishing to Chrome Web Store.

## Monitoring

### Health Checks

- Backend API: http://your-domain:3000/health
- ML Service: http://your-domain:5000/health

### Logs

View logs with Docker:
```bash
docker-compose logs -f backend
docker-compose logs -f ml-service
```

### Metrics

Consider adding:
- Prometheus for metrics collection
- Grafana for visualization
- Application Performance Monitoring (APM)

## Scaling

### Horizontal Scaling

1. Backend API:
```yaml
backend:
  deploy:
    replicas: 3
```

2. ML Service:
```yaml
ml-service:
  deploy:
    replicas: 2
```

### Database Scaling

- Set up read replicas for heavy read loads
- Consider connection pooling (already configured)
- Use pgvector indexes for fast similarity search

### Queue Scaling

- Use Redis cluster for distributed processing
- Add more worker processes for job processing

## Backup and Recovery

### Database Backups

Automated daily backups:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U postgres tab_bookmark_manager | gzip > /backup/db_$DATE.sql.gz
```

### Archive Backups

Sync archives to cloud storage:
```bash
# Example with AWS S3
aws s3 sync ./backend/archives s3://your-bucket/archives
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker exec postgres pg_isready -U postgres
```

### ML Service errors
```bash
# Check if models are downloaded
docker-compose logs ml-service

# Restart service
docker-compose restart ml-service
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up API authentication
- [ ] Enable CORS properly
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
