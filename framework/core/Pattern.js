const Pattern = {
  Decorator: {
    invokeAll: (argMap) => {
      return () => {
        for (let [context, func] of argMap) {
          if (func)
            func.apply(context);
        }
      };
    }
  }
};

export default Pattern;