export type Task = {
    id: number;
    hardness: number;
};

export type Tasks = Set<Task>;

export type AssignedTasks = Map<number, {
    task: Task;
    status: '' | 'assigning' | 'processing' | 'done';
}>;

export type VirtualMachineReference = {
    id: string;
    lastMessage: number;
    lastPing: number;
};

export type VirtualMachinesReference = Set<VirtualMachineReference>;

export type Combination = {
    task: Task;
    vmId: VirtualMachineReference['id'];
};

export type CandidateSchedule = {
    combination: Array<Combination>;
    estimatedTime: number;
};
