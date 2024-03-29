import { useRef } from 'react';

const usePagingParam = () => {
  console.log('usePagingParam render');

  const searchs = useRef([]);
  const includes = useRef([]);
  const sorts = useRef([]);
  const param = useRef({});

  const addSearch = (item) => {
    searchs.current = [...searchs.current, item];
  };

  const addInclude = (item) => {
    includes.current = [...includes.current, item];
  };

  const addSort = (item) => {
    sorts.current = [...sorts.current, item];
  };

  const build = () => {
    param.current = {
      Searchs: searchs.current,
      Includes: includes.current,
      Sorts: sorts.current
    }
  }

  const reset = () => {
    searchs.current = [];
    includes.current = [];
    sorts.current = [];
    param.current = {};
  }

  return {
    addSearch,
    addInclude,
    addSort,
    build,
    reset,
    param
  };
}

export default usePagingParam;