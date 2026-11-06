# Frontend contract

Build public pages, customer-account routes, and staff portal routes as separately guarded route groups.
Every route segment must have an error boundary and data sections should fail independently with a retry path.
The department UI uses shared ARTIC design tokens but deploys as its own Next.js application.
