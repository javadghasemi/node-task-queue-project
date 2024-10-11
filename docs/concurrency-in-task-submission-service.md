# Concurrency Handling in Task Submission Service

This document describes how concurrency is managed in the Task Submission Service when operating in clustering mode and
explains the rationale behind using a cron job and outbox pattern for publishing tasks.

## 1. Concurrency Handling in Clustering Mode

### Overview

When running multiple instances of the Task Submission Service in a clustered environment, effective concurrency
management is crucial to avoid duplicate task processing and ensure data integrity. The implementation leverages
optimistic locking in the task entity and advisory locks provided by PostgreSQL.

### Reasons for Using Locks

- **Optimistic Locking:** This approach allows the application to handle conflicts gracefully by checking if the version
  of the task in the database matches the version being processed. If a conflict is detected (i.e., the version has
  changed), the process will need to be retried or handled appropriately, ensuring that only one instance can modify a
  task at a time.

- **Advisory Locks:** These locks prevent multiple instances from processing the same task simultaneously. They are
  utilized to control access to task processing, ensuring that only one instance can process a given task at any moment.

### Required Actions and Implications When Using Locks

1. #### With Optimistic Locking:
    - **Conflict Detection:** If a conflict occurs (i.e., the version of the task in the database has changed since it
      was retrieved), the application must handle the conflict by either retrying the operation or informing the user.
      This ensures that no lost updates happen, but it may result in additional processing overhead.
    - **Potential Failures:** If conflicts occur frequently, it can lead to increased retries and reduced throughput, as
      tasks may need to be reprocessed.
2. #### With Advisory Locks:
    - **Lock Acquisition:** If a task is being processed by another instance, the current instance will be unable to
      acquire the lock and must skip that task. This prevents concurrent processing of the same task but may lead to
      delayed processing if multiple instances are competing for the same tasks.
    - **Stale Locks:** If the instance holding the lock crashes without releasing it, other instances may be blocked
      indefinitely from processing that task unless a timeout or manual intervention occurs.
3. #### Using Both Locks Together:
    - **Enhanced Integrity:** Using both optimistic and advisory locks together helps ensure that only one instance can
      process a task at a time while also checking for version conflicts. This approach minimizes the risk of duplicate
      processing and maintains data integrity.
    - **Complex Error Handling:** The combination requires careful error handling. If a task lock is acquired but a
      version conflict occurs during processing, the task may need to be retried, and the advisory lock should be
      released to avoid blocking other instances.
    - **Increased Complexity:** Managing both locking mechanisms can add complexity to the application logic, as
      developers need to account for possible conflicts and locking scenarios.

### Alternative Concurrency Solutions

While the current approach employs optimistic locking and advisory locks, other solutions for handling concurrency in a
clustered environment include leader election strategies using tools like **ZooKeeper** or **Kubernetes (K8s)**.

- **Leader Election with ZooKeeper:** ZooKeeper can be used to establish a leader among instances. The leader would be
  responsible for processing tasks, while other instances remain in standby mode. This approach can effectively prevent
  duplicate processing but introduces complexity related to leader failover and maintenance.
- **Leader Election with Kubernetes:** Kubernetes also supports leader election through its built-in primitives, such as
  StatefulSets or ConfigMaps. By electing a leader, task processing can be centralized to one instance at a time,
  reducing the chance of concurrent processing. However, this method requires proper configuration and monitoring to
  ensure reliability.

### Important Note on Cron Job with Leader Election

If a leader election strategy is used, the cron job responsible for processing tasks must only be started on the leader
instance. This ensures that only one instance is responsible for invoking the task processing logic, preventing
duplicate task handling and maintaining consistency across the cluster.

## Implementation Details

### Outbox Cron Service

The **Outbox Cron Service** uses a scheduled job to periodically trigger task processing. The cron job runs every 10
seconds
and invokes the outbox processing service to check for pending tasks.

### Process Outbox Pending Entries

In this step, the service retrieves pending tasks from the outbox and attempts to acquire a lock for each task. If a
lock cannot be acquired, it indicates that another instance is processing the task, and the current instance will skip
it.

During the processing of tasks, optimistic locking ensures that the task version is checked before any updates are made.
If the version in the database does not match the version being processed, an error is raised, allowing the service to
handle the conflict appropriately.

**Best Practice:** One of the best outbox pattern solutions is to read the database log and then add it to the queue.
This approach effectively captures changes made to the database and ensures that all tasks are processed without missing
any updates.

### Lock Service

The **Lock Service** manages acquiring and releasing advisory locks. When processing tasks, it tries to acquire a lock
for the task being processed. If successful, the task can be safely processed, and the lock is released once processing
is complete, regardless of whether the operation was successful or not.

## 2. Using Cron Job for Publishing Tasks

Using a cron job for publishing tasks in the **Task Submission Service** provides several advantages:

- **Regular Interval Processing:** By setting a fixed interval (e.g., every 10 seconds), tasks are published promptly
  without relying on external triggers. This regular processing reduces the likelihood of backlog in the outbox.
- **Decoupling from Task Creation:** Separating task creation from task publishing allows for better control over how
  tasks are handled, which is beneficial for monitoring and debugging.
- **Reliability:** Periodic processing of the outbox ensures that no tasks are missed, even if there are temporary
  issues with the task queue or processing logic.
- **Load Balancing:** In a clustered environment, multiple instances can process tasks concurrently without overlapping,
  ensuring efficient task handling.
