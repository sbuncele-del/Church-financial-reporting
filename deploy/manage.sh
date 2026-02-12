#!/bin/bash
# ============================================================
# Management Script - Church Financial Reporting System
# Common operations for the Vultr VPS deployment
#
# Usage: ./deploy/manage.sh [command]
# ============================================================

SERVER_IP="139.84.231.20"
SERVER_USER="root"
APP_DIR="/opt/church-app"
SSH_CMD="ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}"
COMPOSE_CMD="docker compose -f docker-compose.prod.yml"

case "${1:-help}" in
    status)
        echo "=== Container Status ==="
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} ps"
        ;;
    logs)
        SERVICE="${2:-}"
        echo "=== Logs ${SERVICE} ==="
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} logs --tail=100 ${SERVICE}"
        ;;
    logs-follow)
        SERVICE="${2:-}"
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} logs -f ${SERVICE}"
        ;;
    restart)
        SERVICE="${2:-}"
        echo "=== Restarting ${SERVICE:-all services} ==="
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} restart ${SERVICE}"
        ;;
    stop)
        echo "=== Stopping all services ==="
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} down"
        ;;
    start)
        echo "=== Starting all services ==="
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} up -d"
        ;;
    rebuild)
        SERVICE="${2:-}"
        echo "=== Rebuilding ${SERVICE:-all services} ==="
        ${SSH_CMD} "cd ${APP_DIR} && ${COMPOSE_CMD} build --no-cache ${SERVICE} && ${COMPOSE_CMD} up -d ${SERVICE}"
        ;;
    shell-backend)
        echo "=== Opening shell in backend container ==="
        ${SSH_CMD} -t "docker exec -it church-backend-prod /bin/bash"
        ;;
    shell-db)
        echo "=== Opening PostgreSQL shell ==="
        ${SSH_CMD} -t "docker exec -it church-db-prod psql -U churchms church_financial"
        ;;
    db-backup)
        BACKUP_FILE="church_backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "=== Creating database backup: ${BACKUP_FILE} ==="
        ${SSH_CMD} "docker exec church-db-prod pg_dump -U churchms church_financial" > "${BACKUP_FILE}"
        echo "Backup saved to: ${BACKUP_FILE}"
        ;;
    db-restore)
        if [ -z "${2:-}" ]; then
            echo "Usage: ./deploy/manage.sh db-restore <backup_file.sql>"
            exit 1
        fi
        echo "=== Restoring database from ${2} ==="
        cat "${2}" | ${SSH_CMD} "docker exec -i church-db-prod psql -U churchms church_financial"
        ;;
    health)
        echo "=== Health Check ==="
        curl -s "http://${SERVER_IP}/health" | python3 -m json.tool 2>/dev/null || echo "  Server not responding"
        echo ""
        echo "=== Resource Usage ==="
        ${SSH_CMD} "echo 'Memory:' && free -h && echo '' && echo 'Disk:' && df -h / && echo '' && echo 'Docker:' && docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}'"
        ;;
    ssh)
        echo "=== Connecting to server ==="
        ${SSH_CMD}
        ;;
    help|*)
        echo "Church Financial Reporting - VPS Management"
        echo ""
        echo "Usage: ./deploy/manage.sh [command] [service]"
        echo ""
        echo "Commands:"
        echo "  status          Show container status"
        echo "  logs [service]  Show last 100 log lines"
        echo "  logs-follow     Follow logs in real-time"
        echo "  restart [svc]   Restart service(s)"
        echo "  stop            Stop all services"
        echo "  start           Start all services"
        echo "  rebuild [svc]   Rebuild and restart service(s)"
        echo "  shell-backend   Open shell in backend container"
        echo "  shell-db        Open PostgreSQL shell"
        echo "  db-backup       Backup database to local file"
        echo "  db-restore <f>  Restore database from file"
        echo "  health          Health check + resource usage"
        echo "  ssh             SSH into the server"
        echo ""
        echo "Services: db, backend, frontend"
        echo ""
        echo "Examples:"
        echo "  ./deploy/manage.sh logs backend"
        echo "  ./deploy/manage.sh restart frontend"
        echo "  ./deploy/manage.sh rebuild backend"
        ;;
esac
