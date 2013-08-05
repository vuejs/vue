- complete arrayWatcher

- computed properties (through invoking functions, need to rework the setter triggering mechanism using emitter)

- the data object passed in should become an absolute source of truth, so multiple controllers can bind to the same data (i.e. second seed using it should insert dependency instead of overwriting it)

- nested properties in scope (kinda hard but try)

- parse textNodes