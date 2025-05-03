const normalizedId = (item) => {
  return item._id || item.id || null;
};
  
export default normalizedId;