
const slugify = async (title, Model) => {
    let slug = title.toLowerCase().replace(/ /g, '-');
    let uniqueSlug = slug;
    let count = 1;
  
    while (await Model.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }
  
    return uniqueSlug;
  }
export default slugify;