export default {
  template: `
    <commits
      :current-branch="currentBranch"
      :branches="branches"
      :apiUrl="apiUrl"
      :commits="commits">
    </commits>`
};
