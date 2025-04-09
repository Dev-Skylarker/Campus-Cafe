# Campus Cafe System Diagrams

This document contains diagrams representing the structure, flow, and interactions of the Campus Cafe System. These diagrams help visualize the system architecture and provide a better understanding of how the system components interact with each other and with external entities.

## Context Diagram

A context diagram represents the system as a single process and shows its interactions with external entities. It provides a high-level view of the system scope and boundaries.

### Explanation

The context diagram for the Campus Cafe System depicts:
- The system as a single entity (Campus Cafe System)
- External entities that interact with the system (Customers, Admin Staff, Payment Processor)
- Data flows between the system and external entities
- The system boundary that separates the system from its environment

### Campus Cafe System Context Diagram

```
                               +-------------------+
                               |                   |
           Menu View           |                   |
      +----------------------->|                   |
      |                        |                   |
      |    Order Placement     |                   |
      +----------------------->|                   |
      |                        |                   |
      |    Order Status        |     CAMPUS        |
      |<-----------------------+                   |
      |                        |      CAFE         |
+------------+   Payment Info  |                   |    Authentication   +------------+
|            +---------------->|     SYSTEM        |<-------------------+|            |
| CUSTOMERS  |                 |                   |                     |   ADMIN    |
|            |  Payment Status |                   |    Menu Updates     |   STAFF    |
|            |<----------------+                   +-------------------->|            |
+------------+                 |                   |                     +------------+
                               |                   |
                               |                   |    Payment Processing    +------------+
                               |                   +------------------------>|            |
                               |                   |                         |  PAYMENT   |
                               |                   |    Transaction Status   |  PROCESSOR |
                               |                   |<------------------------+            |
                               +-------------------+                         +------------+
```

### Key Insights

- The context diagram clearly shows that the Campus Cafe System serves as the central hub for all operations
- Customers interact with the system to view menu items, place orders, check order status, and make payments
- Admin staff manage the system by updating menu items and monitoring operations
- The payment processor is an external system that handles financial transactions
- The diagram provides a clear boundary of what is within the system scope and what is external

## Data Flow Diagram (DFD)

A Data Flow Diagram illustrates how data moves through the system, showing processes, data stores, external entities, and the data flows between them.

### Explanation

The DFD for the Campus Cafe System shows:
- Processes that transform data (represented by circles/bubbles)
- Data stores that hold information (represented by parallel lines)
- External entities that interact with the system (represented by rectangles)
- Data flows that show the movement of information (represented by arrows)

### Campus Cafe System DFD - Level 0

```
                                                  +-------------+
                                                  |             |
                                    +------------>| Admin Staff |
                                    |             |             |
                                    |             +-------------+
                                    |                   ^
                                    |                   |
                                    | Menu              | Authentication
                                    | Management        | & Reports
                                    |                   |
                                    v                   |
+-------------+   Menu    +-------------------+    +-------------------+
|             |  Request  |                   |    |                   |
| Customers   +---------->|   Menu Display    +--->|  Admin Dashboard  |
|             |           |    Process        |    |     Process       |
+-------------+           |                   |    |                   |
      ^                   +-------------------+    +-------------------+
      |                           |                      ^
      |                           v                      |
      |                   +-------------------+          |
      |    Order Status   |                   |    Item  |
      +-------------------+   Order Processing |    Data |
      |                   |      Process       |         |
      |                   |                   <----------+
      |                   +-------------------+
      |                           |
      |                           v
      |                   +-------------------+
      |   Payment Status  |                   |
      +-------------------+  Payment Process  |-------->+-------------+
                          |                   |         |             |
                          +-------------------+         | Payment     |
                                  ^                     | Processor   |
                                  |                     |             |
                                  | Payment Info        +-------------+
                                  |
                         +-------------------+
                         |                   |
                         |    Data Store     |
                         |                   |
                         +-------------------+
                                  ^
                                  |
                                  | Persistent
                                  | Storage
                                  |
                         +-------------------+
                         |                   |
                         |  Firebase/Local   |
                         |     Storage       |
                         |                   |
                         +-------------------+
```

### Key Insights

- The DFD shows how data flows through the system, providing a more detailed view than the context diagram
- The diagram reveals the key processes: Menu Display, Order Processing, Payment Processing, and Admin Dashboard
- Data storage components show where information is stored and retrieved
- The diagram helps identify potential bottlenecks or areas where data transformation may be complex

## Use Case Diagram

A Use Case Diagram illustrates the interactions between actors (users) and the system, showing what the system does from a user's perspective.

### Explanation

The Use Case Diagram for the Campus Cafe System depicts:
- Actors that interact with the system (Customer, Admin, System)
- Use cases that represent system functions or features
- Relationships between actors and use cases
- Relationships between use cases (include, extend, generalization)

### Campus Cafe System Use Case Diagram

```
                                +------------------------------------------+
                                |            Campus Cafe System            |
                                |                                          |
                                |  +------------+        +------------+    |
                                |  |            |        |            |    |
                                |  | View Menu  |<-------| Filter Menu|    |
                                |  |            |        |            |    |
                                |  +------------+        +------------+    |
                                |         ^                                |
                                |         |                                |
                                |         |                                |
+----------+                    |  +------------+        +------------+    |
|          |                    |  |            |        |            |    |
| Customer +--------------------->| Place Order |<-------| Add to Cart|    |
|          |                    |  |            |        |            |    |
+----------+                    |  +------------+        +------------+    |
      |                         |         |                                |
      |                         |         |                                |
      |                         |         v                                |
      |                         |  +------------+                          |
      |                         |  |            |                          |
      +-------------------------->| Track Order |                          |
      |                         |  |            |                          |
      |                         |  +------------+                          |
      |                         |         |                                |
      |                         |         |                                |
      |                         |         v                                |
      |                         |  +------------+                          |
      |                         |  |            |                          |
      +-------------------------->| Make Payment|                          |
                               |  |            |                          |
                               |  +------------+                          |
                               |                                          |
+----------+                   |  +------------+        +------------+    |
|          |                   |  |            |        |            |    |
|  Admin   +--------------------->| Manage Menu|------->| Add/Edit/  |    |
|          |                   |  |            |        | Delete Item|    |
+----------+                   |  +------------+        +------------+    |
      |                        |                                          |
      |                        |  +------------+                          |
      |                        |  |            |                          |
      +-------------------------->| View Orders|                          |
      |                        |  |            |                          |
      |                        |  +------------+                          |
      |                        |                                          |
      |                        |  +------------+                          |
      |                        |  |            |                          |
      +-------------------------->| Generate   |                          |
                               |  | Reports    |                          |
                               |  |            |                          |
                               |  +------------+                          |
                               |                                          |
                               +------------------------------------------+
```

### Key Insights

- The Use Case Diagram clearly shows what users can do with the system
- Customer use cases include viewing the menu, placing orders, tracking orders, and making payments
- Admin use cases include managing menu items, viewing orders, and generating reports
- The diagram helps in understanding the system functionality from a user perspective, which is essential for designing user interfaces and user experiences
- Relationships between use cases show dependencies and extensions, providing a better understanding of the system's workflow

## Entity Relationship Diagram (ERD)

An Entity Relationship Diagram shows the relationships between data entities in the system. For the Campus Cafe System, this includes menu items, orders, users, and other relevant entities.

### Explanation

The ERD for the Campus Cafe System depicts:
- Entities (represented by rectangles)
- Attributes of entities
- Relationships between entities (represented by lines)
- Cardinality of relationships (one-to-one, one-to-many, many-to-many)

### Campus Cafe System ERD

```
+---------------+       +---------------+       +---------------+
|               |       |               |       |               |
|     User      |       |     Order     |       |   Order Item  |
|               |       |               |       |               |
+---------------+       +---------------+       +---------------+
| PK: userId    |<------| FK: userId    |       | FK: orderId   |
|    name       |       | PK: orderId   |<------| FK: menuItemId|
|    email      |       |    timestamp  |       |    quantity   |
|    password   |       |    status     |       |    price      |
|    role       |       |    total      |       |               |
|    photoURL   |       |               |       |               |
+---------------+       +---------------+       +---------------+
                                                        |
                                                        |
                                                        v
+---------------+       +---------------+       +---------------+
|               |       |               |       |               |
|   Category    |       |   Menu Item   |       |   Ingredient  |
|               |       |               |       |               |
+---------------+       +---------------+       +---------------+
| PK: categoryId|<------| FK: categoryId|       | FK: menuItemId|
|    name       |       | PK: menuItemId|<------| PK: name      |
|    description|       |    name       |       |               |
|               |       |    price      |       |               |
|               |       |    description|       |               |
|               |       |    imageUrl   |       |               |
|               |       |    featured   |       |               |
|               |       |    availability|      |               |
+---------------+       +---------------+       +---------------+
```

### Key Insights

- The ERD shows how data is organized in the system's database
- Key entities include User, Order, Order Item, Menu Item, Category, and Ingredient
- Relationships demonstrate how these entities are connected (e.g., a User has many Orders, an Order has many Order Items)
- The diagram helps in designing the database schema and understanding data relationships
- Primary Keys (PK) and Foreign Keys (FK) are used to establish relationships between entities

## Conclusion

These diagrams provide different perspectives of the Campus Cafe System, helping stakeholders understand:

- The system boundary and external interactions (Context Diagram)
- How data flows through the system (Data Flow Diagram)
- What users can do with the system (Use Case Diagram)
- How data is structured and related (Entity Relationship Diagram)

Together, they form a comprehensive visual representation of the system architecture, functionality, and data organization, which is essential for development, maintenance, and communication with stakeholders. 