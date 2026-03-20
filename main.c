#include <stdio.h>
#include <stdlib.h>

typedef struct node {
  int data;
  struct node *next;
} node;

node *createNode(int data) {
  node *newNode = (node *)malloc(sizeof(node));
  newNode->data = data;
  newNode->next = NULL;
  return newNode;
}

void insertAtEnd(node **head, int data) {
  node *newNode = createNode(data);
  if (*head == NULL) {
    *head = newNode;
    return;
  }
  node *temp = *head;
  while (temp->next != NULL) {
    temp = temp->next;
  }
  temp->next = newNode;
}

void printList(node *head) {
  node *temp = head;
  while (temp != NULL) {
    printf("%d ", temp->data);
    temp = temp->next;
  }
  printf("\n");
}

int main() {
  node *head = NULL;
  insertAtEnd(&head, 1);
  insertAtEnd(&head, 2);
  insertAtEnd(&head, 3);
  printList(head);
  return 0;
}