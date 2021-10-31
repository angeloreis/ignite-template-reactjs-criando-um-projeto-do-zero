import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import Header from '../components/Header';

import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <Header />
      <main className={styles.ContainerPosts}>
        <div className={styles.posts}>
          {postsPagination.results.map((post) => (
            <Link href={`/posts/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div className={styles.InfoPost}>
                <FiCalendar /><time>{post.first_publication_date}</time>
                <FiUser /><p>{post.data.author}</p>
              </div>
            </a>
          </Link>
          ))}
        </div>        
      </main>
      <div className={styles.ContainerLoadMore}>
        <button className={styles.buttonLoadMore} type="button">Carregar mais post</button>
      </div>      
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 10,
    }
  );

  const posts: Post[] = [] as Post[];

  response.results.map(post => {
    const {uid, first_publication_date, data} = post;
    const {author, title, subtitle} = data;
    const NewDatePublicationFormatted = format(new Date(first_publication_date),"dd 'de' MMM 'de' yyy",{locale: ptBR} );
      posts.push({    
        uid,
        first_publication_date: NewDatePublicationFormatted,
        data: {
          author,
          title,
          subtitle
        }
      })
  })

  const PaginationBlog = {
    postsPagination: {
      next_page: response.next_page, 
      results: posts
    }
  }

  return {
    props: { postsPagination: PaginationBlog.postsPagination },
  };
};