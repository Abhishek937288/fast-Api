# User Onboarding Background Processor

This project demonstrates handling **heavy batch operations** (like updating users) without blocking your main API using **BullMQ**, **Redis**, and **MongoDB**.

We process users in batches, track completion, and handle errors efficiently.

---

## Table of Contents

- [Project Setup](#project-setup)  
- [How It Works](#how-it-works)  
- [Key Components](#key-components)  
- [Worker Events](#worker-events)  
- [Error Handling](#error-handling)  
- [Job Retry & Safety](#job-retry--safety)  
- [API Endpoints](#api-endpoints)  

---

## Project Setup

1. **Install Dependencies**

```bash
pnpm install
